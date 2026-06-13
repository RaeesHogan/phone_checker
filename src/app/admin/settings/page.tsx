import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch current settings
  const settingsList = await prisma.setting.findMany();
  const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

  return <SettingsClient initialSettings={settings} />;
}
