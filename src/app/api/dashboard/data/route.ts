import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const isAdmin = userRole === "ADMIN";

  const baseFilter: any = {};
  if (!isAdmin) {
    baseFilter.createdBy = userId;
  }

  try {
    const now = new Date();

    const [total, active, expired, cancelled] = await Promise.all([
      prisma.reservation.count({ where: baseFilter }),
      // Active = status ACTIVE and not yet expired
      prisma.reservation.count({
        where: {
          ...baseFilter,
          status: "ACTIVE",
          expirationDate: { gt: now }
        }
      }),
      // Expired = status EXPIRED in DB, OR status ACTIVE but past expiry date
      prisma.reservation.count({
        where: {
          ...baseFilter,
          OR: [
            { status: "EXPIRED" },
            {
              status: "ACTIVE",
              expirationDate: { lte: now }
            }
          ]
        }
      }),
      prisma.reservation.count({
        where: {
          ...baseFilter,
          status: "CANCELLED"
        }
      }),
    ]);

    const recent = await prisma.reservation.findMany({
      where: {
        ...baseFilter,
        status: "ACTIVE",
        expirationDate: { gt: now }
      },
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
        total,
        active, 
        expired 
      },
      recent
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
