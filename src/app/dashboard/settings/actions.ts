"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";

export type SettingsActionState = { error?: string; success?: string };

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  await prisma.user.update({ where: { id: user.id }, data: { name } });
  revalidatePath("/dashboard/settings");
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireCurrentUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (!user.hashedPassword) {
    return { error: "This account signs in via Google and has no password to change." };
  }

  const valid = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!valid) return { error: "Current password is incorrect." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { hashedPassword } });
  return { success: "Password changed." };
}

export async function deleteAccountAction() {
  const user = await requireCurrentUser();
  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/" });
}
