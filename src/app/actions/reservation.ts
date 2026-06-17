"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { normalizePhoneNumber, isValidThaiPhone } from "@/lib/phone-utils";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

import { z } from "zod";

const reservationItemSchema = z.object({
  productCode: z.string().min(1, "รหัสสินค้าต้องไม่ว่าง").max(50, "รหัสสินค้ายาวเกินไป"),
  quantity: z.number().int().positive("จำนวนต้องมากกว่า 0"),
  isMainProduct: z.boolean().default(false),
});

const createReservationSchema = z.object({
  customerName: z.string().min(1, "กรุณากรอกชื่อลูกค้า").max(100, "ชื่อลูกค้ายาวเกินไป"),
  phoneNumber: z.string().refine(isValidThaiPhone, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
  address: z.string().min(1, "กรุณากรอกที่อยู่").max(300, "ที่อยู่ยาวเกินไป"),
  totalPrice: z.number().nonnegative("ราคาต้องไม่ติดลบ"),
  notes: z.string().max(500, "หมายเหตุยาวเกินไป").nullable(),
  items: z.array(reservationItemSchema).min(1, "ต้องมีสินค้าอย่างน้อย 1 รายการ"),
});

export async function createReservation(data: any) {
  const session = await auth();
  if (!session || !session.user) {
    return { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
  }

  // Support both FormData (old) and JSON (new) for transition
  let payload: any;
  if (data instanceof FormData) {
    const rawItems = data.get("items") ? JSON.parse(data.get("items") as string) : [
      {
        productCode: (data.get("productCode") as string)?.trim(),
        quantity: 1,
        isMainProduct: true,
      }
    ];

    payload = {
      customerName: (data.get("customerName") as string)?.trim(),
      phoneNumber: normalizePhoneNumber((data.get("phoneNumber") as string)?.trim()),
      address: (data.get("address") as string)?.trim(),
      totalPrice: parseFloat(data.get("totalPrice") as string || "0"),
      notes: (data.get("notes") as string)?.trim() || null,
      items: rawItems,
    };
  } else {
    payload = {
      ...data,
      phoneNumber: normalizePhoneNumber(data.phoneNumber),
    };
  }

  // 1. Validate with Zod
  const validation = createReservationSchema.safeParse(payload);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const validatedData = validation.data;
  const newProductCodes = validatedData.items.map(i => i.productCode);

  try {
    // 2. Transactional Validation (Product-Level Locking)
    return await prisma.$transaction(async (tx) => {
      // Find all ACTIVE reservation items for this phone
      const activeItems = await tx.reservationItem.findMany({
        where: {
          reservation: {
            phoneNumber: validatedData.phoneNumber,
            status: "ACTIVE",
            expirationDate: { gt: new Date() },
          },
        },
        select: { productCode: true },
      });

      const existingCodes = new Set(activeItems.map(i => i.productCode));
      const duplicates = newProductCodes.filter(code => existingCodes.has(code));

      if (duplicates.length > 0) {
        return { error: `สินค้าต่อไปนี้ถูกจองไว้แล้วสำหรับเบอร์นี้: ${duplicates.join(", ")}` };
      }

      // 3. Get expiration days
      const expireDaysSetting = await tx.setting.findUnique({ where: { key: "RESERVATION_EXPIRE_DAYS" } });
      const days = expireDaysSetting ? parseInt(expireDaysSetting.value) : 14;

      // 4. Create Reservation & Items
      const reservation = await tx.reservation.create({
        data: {
          customerName: validatedData.customerName,
          phoneNumber: validatedData.phoneNumber,
          address: validatedData.address,
          totalPrice: validatedData.totalPrice,
          notes: validatedData.notes,
          expirationDate: addDays(new Date(), days),
          createdBy: (session.user as any).id,
          items: {
            create: validatedData.items.map(item => ({
              productCode: item.productCode,
              phoneNumber: validatedData.phoneNumber,
              status: "ACTIVE",
              quantity: item.quantity,
              isMainProduct: item.isMainProduct,
            })),
          },
          // Legacy field support for older queries if needed
          productCode: validatedData.items.find(i => i.isMainProduct)?.productCode || validatedData.items[0].productCode,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: (session.user as any).id,
          action: "CREATE_RESERVATION",
          details: { 
            reservationId: reservation.id,
            phoneNumber: validatedData.phoneNumber, 
            itemCount: validatedData.items.length 
          },
        },
      });

      return { success: true };
    }, {
      isolationLevel: 'Serializable',
    });

  } catch (error) {
    console.error("Create reservation error:", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  } finally {
    revalidatePath("/dashboard");
  }
}

export async function cancelReservation(id: string) {
  const session = await auth();
  if (!session || !session.user) return { error: "Unauthorized" };

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    // 1. Fetch reservation to check ownership
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { createdBy: true }
    });

    if (!reservation) return { error: "ไม่พบข้อมูลการจอง" };

    // 2. Authorization Check: Only Creator or Admin can cancel
    if (reservation.createdBy !== userId && userRole !== "ADMIN") {
      console.warn(`[SECURITY ALERT] Unauthorized cancel attempt by ${userId} on reservation ${id}`);
      return { error: "คุณไม่มีสิทธิ์ยกเลิกรายการจองนี้" };
    }

    // 3. Update status (Sync to items for strict locking index)
    await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
      prisma.reservationItem.updateMany({
        where: { reservationId: id },
        data: { status: "CANCELLED" },
      })
    ]);

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "CANCEL_RESERVATION",
        details: { reservationId: id, authorizedBy: userRole },
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Cancel reservation error:", error);
    return { error: "ไม่สามารถยกเลิกการจองได้" };
  }
}
