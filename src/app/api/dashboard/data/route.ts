import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [total, active, expired, cancelled] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "ACTIVE" } }),
      prisma.reservation.count({ where: { status: "EXPIRED" } }),
      prisma.reservation.count({ where: { status: "CANCELLED" } }),
    ]);

    const recent = await prisma.reservation.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: {
          select: {
            fullName: true,
            username: true,
          }
        }
      },
      orderBy: { expirationDate: "asc" },
      take: 20,
    });

    return NextResponse.json({
      stats: { 
        total: active + expired, // Show total relevant (non-cancelled) or just total? 
        active, 
        expired 
      },
      recent
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
