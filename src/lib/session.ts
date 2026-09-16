import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Fetches the fresh User row (with current plan/billing fields) for the signed-in session, or null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** Same as getCurrentUser, but throws if there is no signed-in user. */
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
