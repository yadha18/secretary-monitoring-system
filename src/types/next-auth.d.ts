import type { DefaultSession } from "next-auth";

import type { USER_ROLES } from "@/lib/constants";

type Role = (typeof USER_ROLES)[number];

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
