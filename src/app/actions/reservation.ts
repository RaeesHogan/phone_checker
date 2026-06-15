"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { normalizePhoneNumber, isValidThaiPhone } from "@/lib/phone-utils";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

export async function createReservation(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    return { error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
  }

  const customerName = (formData.get("customerName") as string)?.trim();
  const rawPhone = (formData.get("phoneNumber") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const productCode = (formData.get("productCode") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  // 1. Validate required fields
  if (!customerName || !rawPhone || !address || !productCode) {
    return { error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" };
  }

  // 2. Max-length guards
  if (customerName.length > 100) return { error: "ชื่อลูกค้ายาวเกินไป (max 100 ตัวอักษร)" };
  if (address.length > 300) return { error: "ที่อยู่ยาวเกินไป (max 300 ตัวอักษร)" };
  if (productCode.length > 50) return { error: "รหัสสินค้ายาวเกินไป (max 50 ตัวอักษร)" };
  if (notes && notes.length > 500) return { error: "หมายเหตุยาวเกินไป (max 500 ตัวอักษร)" };

  const normalizedPhone = normalizePhoneNumber(rawPhone);
  if (!isValidThaiPhone(normalizedPhone)) {
    return { error: "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลัก)" };
  }

  try {
    // 2. Check for existing active reservation
    const existing = await prisma.reservation.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        status: "ACTIVE",
        expirationDate: {
          gt: new Date(),
        },
      },
    });

    if (existing) {
      return { error: "เบอร์โทรศัพท์นี้มีการจองที่ยังใช้งานอยู่แล้ว" };
    }

    // 3. Get expiration days from settings or default
    const expireDaysSetting = await prisma.setting.findUnique({ where: { key: "RESERVATION_EXPIRE_DAYS" } });
    const days = expireDaysSetting ? parseInt(expireDaysSetting.value) : 14;

    // 4. Create
    await prisma.reservation.create({
      data: {
        customerName,
        phoneNumber: normalizedPhone,
        address,
        productCode,
        notes,
        expirationDate: addDays(new Date(), days),
        createdBy: (session.user as any).id,
      },
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_RESERVATION",
        details: { phoneNumber: normalizedPhone, customerName },
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create reservation error:", error);
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
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

    // 3. Update status
    await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

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
