import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  // 1. Auth Check (Admin Only)
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Fetch Data (hard-limited to 10,000 rows to prevent OOM on large datasets)
    const reservations = await prisma.reservation.findMany({
      take: 10000,
      include: {
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. Create Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reservations");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "ชื่อลูกค้า", key: "customerName", width: 20 },
      { header: "เบอร์โทรศัพท์", key: "phoneNumber", width: 15 },
      { header: "สินค้า/รหัส", key: "productCode", width: 15 },
      { header: "ที่อยู่", key: "address", width: 30 },
      { header: "สถานะ", key: "status", width: 12 },
      { header: "วันที่จอง", key: "reservationDate", width: 20 },
      { header: "วันที่หมดอายุ", key: "expirationDate", width: 20 },
      { header: "ผู้จอง", key: "createdBy", width: 20 },
      { header: "หมายเหตุ", key: "notes", width: 20 },
    ];

    // Style Header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" }
    };

    // 4. Add Rows
    reservations.forEach((r) => {
      worksheet.addRow({
        id: r.id.substring(0, 8),
        customerName: r.customerName,
        phoneNumber: r.phoneNumber,
        productCode: r.productCode,
        address: r.address,
        status: r.status,
        reservationDate: r.reservationDate.toLocaleString("th-TH"),
        expirationDate: r.expirationDate.toLocaleString("th-TH"),
        createdBy: r.user.fullName,
        notes: r.notes || "-",
      });
    });

    // 5. Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="reservations_${new Date().toISOString().split('T')[0]}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
