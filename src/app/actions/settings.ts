"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const expireDays = formData.get("RESERVATION_EXPIRE_DAYS") as string;
  const sessionTimeout = formData.get("SESSION_TIMEOUT_HOURS") as string;

  // Validate: expireDays must be a number between 1-365
  const parsedDays = parseInt(expireDays);
  if (!expireDays || isNaN(parsedDays) || parsedDays < 1 || parsedDays > 365) {
    return { error: "จำนวนวันหมดอายุต้องอยู่ระหว่าง 1-365 วัน" };
  }

  // Validate: sessionTimeout must be a number between 1-720 (30 days max)
  const parsedTimeout = parseInt(sessionTimeout);
  if (!sessionTimeout || isNaN(parsedTimeout) || parsedTimeout < 1 || parsedTimeout > 720) {
    return { error: "Session timeout ต้องอยู่ระหว่าง 1-720 ชั่วโมง" };
  }

  try {
    // Update or Create settings
    const settings = [
      { key: "RESERVATION_EXPIRE_DAYS", value: expireDays },
      { key: "SESSION_TIMEOUT_HOURS", value: sessionTimeout },
    ];

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    // Log the change
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_SYSTEM_SETTINGS",
        details: { settings },
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update settings" };
  }
}
