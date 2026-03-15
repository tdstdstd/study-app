import NextAuth from "next-auth";
import { authConfig } from "./auth-config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}