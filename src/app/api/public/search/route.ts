import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/phone-utils";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "กรุณาระบุเบอร์โทรศัพท์" }, { status: 400 });
  }

  const normalized = normalizePhoneNumber(phone);

  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        phoneNumber: normalized,
        status: "ACTIVE",
      },
      select: {
        status: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ 
        found: false, 
        message: "ไม่พบข้อมูลการจองที่ยังใช้งานอยู่สำหรับเบอร์นี้" 
      });
    }

    return NextResponse.json({
      found: true,
      message: "เบอร์โทรศัพท์นี้มีการจองที่ยังใช้งานอยู่แล้ว"
    });
  } catch (error) {
    console.error("Public search error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการค้นหา" }, { status: 500 });
  }
}
