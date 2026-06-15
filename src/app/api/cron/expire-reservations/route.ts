import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SystemLog } from "@prisma/client";

export async function GET(req: NextRequest) {
  // 1. Verify Authorization (Cron Secret)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 2. Find and update active reservations that have passed expiration date
    const result = await prisma.reservation.updateMany({
      where: {
        status: "ACTIVE",
        expirationDate: {
          lte: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // 3. Log success
    await prisma.systemLog.create({
      data: {
        level: "INFO",
        source: "CRON_JOB_EXPIRATION",
        message: `Updated ${result.count} reservations to EXPIRED status.`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      expiredCount: result.count 
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);

    // Attempt to log error to DB — nested try/catch prevents double-failure
    // if DB itself is the cause of the original error
    try {
      await prisma.systemLog.create({
        data: {
          level: "ERROR",
          source: "CRON_JOB_EXPIRATION",
          message: error.message || "Unknown error during cron job execution",
          stackTrace: error.stack,
        },
      });
    } catch (logError) {
      console.error("Cron Job: Failed to write error log to DB:", logError);
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
