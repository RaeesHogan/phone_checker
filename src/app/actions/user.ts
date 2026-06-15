"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import * as argon2 from "argon2";
import { Role } from "@prisma/client";

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const fullName = formData.get("fullName") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (!username || !fullName || !password) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  if (username.length < 3 || username.length > 50) {
    return { error: "ชื่อผู้ใช้ต้องมี 3-50 ตัวอักษร" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และ _" };
  }

  if (password.length < 1) {
    return { error: "กรุณากรอกรหัสผ่าน" };
  }

  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { username }
    });

    if (existing) {
      return { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" };
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user
    await prisma.user.create({
      data: {
        username,
        fullName,
        passwordHash,
        role,
        active: true,
      }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_USER",
        details: { targetUsername: username, role },
      }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "ไม่สามารถสร้างผู้ใช้งานได้" };
  }
}

export async function updateUserSettings(userId: string, formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" };

  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as Role;

  // Validate role enum value
  if (!Object.values(Role).includes(role)) {
    return { error: "ค่า Role ไม่ถูกต้อง" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { fullName, role }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_USER_INFO",
        details: { targetUserId: userId, fullName, role },
      }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "ไม่สามารถอัปเดตข้อมูลได้" };
  }
}

export async function resetUserPassword(userId: string, formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" };

  const newPassword = formData.get("password") as string;
  if (!newPassword || newPassword.length < 1) return { error: "กรุณากรอกรหัสผ่าน" };

  try {
    const passwordHash = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "RESET_USER_PASSWORD",
        details: { targetUserId: userId },
      }
    });

    return { success: true };
  } catch (error) {
    return { error: "ไม่สามารถรีเซ็ตรหัสผ่านได้" };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" };

  // Prevent admin from deactivating their own account
  if (userId === (session.user as any).id) {
    return { error: "ไม่สามารถเปลี่ยนสถานะบัญชีของตัวเองได้" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { active: !currentStatus }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "TOGGLE_USER_STATUS",
        details: { targetUserId: userId, newStatus: !currentStatus },
      }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้" };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" };

  // Prevent admin from deleting their own account
  if (userId === (session.user as any).id) {
    return { error: "ไม่สามารถลบบัญชีของตัวเองได้" };
  }

  try {
    // Check if user has reservations before deleting (prevent FK constraint error)
    const reservations = await prisma.reservation.count({ where: { createdBy: userId } });
    if (reservations > 0) {
      return { error: "ไม่สามารถลบได้เนื่องจากผู้ใช้มีประวัติการจองในระบบ (แนะนำให้ปิดใช้งานแทน)" };
    }

    await prisma.user.delete({ where: { id: userId } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "DELETE_USER",
        details: { targetUserId: userId },
      }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "ไม่สามารถลบผู้ใช้งานได้" };
  }
}
