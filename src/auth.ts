import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string().min(1) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { username } });
          
          if (!user) {
            console.log(`[AUTH] User not found: ${username}`);
            return null;
          }
          
          if (!user.active) {
            console.log(`[AUTH] User inactive: ${username}`);
            return null;
          }

          const passwordsMatch = await argon2.verify(user.passwordHash, password);
          if (passwordsMatch) {
            return {
              id: user.id,
              username: user.username,
              name: user.fullName,
              role: user.role,
            };
          } else {
            console.log(`[AUTH] Password mismatch for: ${username}`);
          }
        } else {
          console.log(`[AUTH] Invalid credentials format:`, parsedCredentials.error.format());
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
});
