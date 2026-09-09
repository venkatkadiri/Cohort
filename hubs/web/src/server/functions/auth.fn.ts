import { createServerFn } from "@tanstack/react-start";
import { graphqlApi } from "../graphql/client";

export const localSignInFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; role: "teacher" | "enroller" }) => data)
  .handler(async ({ data }: { data: { email: string; role: "teacher" | "enroller" } }) => {
    const { email, role } = data;
    const users = await graphqlApi.listUsers().catch(() => []);
    const user = (users || []).find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error(`No user found with email ${email}`);
    return { id: user.id, role, name: user.name, email: user.email };
  });

export const getSessionFn = createServerFn({ method: "GET" })
  .handler(async () => {
    // Import auth on the server only
    const { auth } = await import("#/lib/auth");
    try {
      const session = await auth.getSession();
      return session ?? null;
    } catch {
      return null;
    }
  });
