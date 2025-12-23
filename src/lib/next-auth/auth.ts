import { PrismaAdapter } from "@auth/prisma-adapter";
import { EspaceMembreProvider } from "@incubateur-ademe/next-auth-espace-membre-provider";
import NextAuth from "next-auth";
import { type AdapterUser } from "next-auth/adapters";
import Nodemailer from "next-auth/providers/nodemailer";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { type UserRole, type UserStatus } from "@/prisma/enums";

type CustomUser = AdapterUser & {
  isSuperAdmin?: boolean;
  role: UserRole;
  status: UserStatus;
  uuid: string;
};

declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    user: CustomUser;
  }
}

const espaceMembreProvider = EspaceMembreProvider({
  fetch,
  fetchOptions: {
    cache: "default",
    next: {
      revalidate: 300, // 5 minutes
    },
  },
});

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: espaceMembreProvider.AdapterWrapper(PrismaAdapter(prisma)),
  callbacks: espaceMembreProvider.CallbacksWrapper({
    async jwt({ espaceMembreMember, token, trigger }) {
      if (trigger === "signIn" && espaceMembreMember) {
        const now = new Date();
        const dbUser = await prisma.user.findUnique({
          where: { username: espaceMembreMember.username },
        });

        if (!dbUser) {
          throw new Error("User not found in database");
        }

        token = {
          ...token,
          user: {
            email: dbUser.email,
            emailVerified: now,
            id: dbUser.id,
            image: dbUser.image,
            isBetaGouvMember: true,
            isSuperAdmin: dbUser.username ? config.admins.includes(dbUser.username) : false,
            name: dbUser.name,
            role: dbUser.role,
            status: dbUser.status,
            username: dbUser.username,
            uuid: dbUser.id,
          },
        };
        token.sub = dbUser.username;
      }
      return token;
    },
    session({ session, token }) {
      session.user = token.user;
      return session;
    },
  }),
  pages: {
    error: "/login/error",
    signIn: "/login",
    signOut: "/logout",
    verifyRequest: "/login/verify-request",
  },
  providers: [
    espaceMembreProvider.ProviderWrapper(
      Nodemailer({
        from: config.mailer.from,
        server: {
          auth: {
            pass: config.mailer.smtp.password,
            user: config.mailer.smtp.login,
          },
          host: config.mailer.host,
          port: config.mailer.smtp.port,
        },
      }),
    ),
  ],
  secret: config.security.auth.secret,
  session: {
    strategy: "jwt",
  },
});
