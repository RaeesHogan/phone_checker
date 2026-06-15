import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/phone-utils";

// In-memory rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่" },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "กรุณาระบุเบอร์โทรศัพท์" }, { status: 400 });
  }

  const normalized = normalizePhoneNumber(phone);

  // Validate phone format before querying DB
  if (!/^\d{10}$/.test(normalized)) {
    return NextResponse.json({ error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        phoneNumber: normalized,
        status: "ACTIVE",
        expirationDate: {
          gt: new Date(),
        },
      },
      select: {
        status: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({
        found: false,
        message: "ไม่พบข้อมูลการจองที่ยังใช้งานอยู่สำหรับเบอร์นี้",
      });
    }

    return NextResponse.json({
      found: true,
      message: "เบอร์โทรศัพท์นี้มีการจองที่ยังใช้งานอยู่แล้ว",
    });
  } catch (error) {
    console.error("Public search error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการค้นหา" }, { status: 500 });
  }
}

