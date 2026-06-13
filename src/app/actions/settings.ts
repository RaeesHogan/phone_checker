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
