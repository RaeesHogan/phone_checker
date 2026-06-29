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

  // Parse Query Params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "default";

  const skip = (page - 1) * limit;

  // Base Filter for Ownership
  const baseFilter: any = {};
  if (!isAdmin) {
    baseFilter.createdBy = userId;
  }

  try {
    const now = new Date();

    // 1. Stats Data (Unaffected by pagination/search)
    const [total, active, expired] = await Promise.all([
      prisma.reservation.count({
        where: { ...baseFilter, status: { not: "CANCELLED" } }
      }),
      prisma.reservation.count({
        where: { ...baseFilter, status: "ACTIVE", expirationDate: { gt: now } }
      }),
      prisma.reservation.count({
        where: {
          ...baseFilter,
          OR: [
            { status: "EXPIRED" },
            { status: "ACTIVE", expirationDate: { lte: now } }
          ]
        }
      }),
    ]);

    // 2. Build Filter for the List
    const listFilter: any = {
      ...baseFilter,
      status: "ACTIVE",
      expirationDate: { gt: now }
    };

    if (search.trim()) {
      const searchStr = search.trim();
      const searchConditions: any[] = [
        { phoneNumber: { contains: searchStr } },
        { customerName: { contains: searchStr, mode: 'insensitive' } }
      ];

      if (isAdmin) {
        searchConditions.push(
          { user: { fullName: { contains: searchStr, mode: 'insensitive' } } },
          { user: { username: { contains: searchStr, mode: 'insensitive' } } }
        );
      }

      listFilter.AND = [{ OR: searchConditions }];
    }

    // 3. Sorting
    let orderBy: any = { expirationDate: "asc" }; // default (days remaining asc)
    if (sort === "desc") {
      orderBy = { expirationDate: "desc" };
    }

    // 4. Fetch Paginated List and Total Count
    const [totalItems, recent] = await Promise.all([
      prisma.reservation.count({ where: listFilter }),
      prisma.reservation.findMany({
        where: listFilter,
        include: {
          user: { select: { fullName: true, username: true } },
          items: { select: { productCode: true, isMainProduct: true, quantity: true } }
        },
        orderBy,
        skip,
        take: limit,
      })
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      stats: { total, active, expired },
      recent,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
