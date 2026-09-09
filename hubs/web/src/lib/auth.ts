import { betterAuth } from "better-auth";
import { graphqlApi } from "../server/graphql/client";

// Build provider config from environment. When you set `BETTER_AUTH_ENABLED=1`
// ensure you provide the provider credentials below. This wiring targets
// Google OAuth when `BETTER_AUTH_PROVIDER=google`.
const provider = process.env.BETTER_AUTH_PROVIDER ?? "google";
let authConfig: any = {};
if (process.env.BETTER_AUTH_ENABLED === "1") {
  if (provider === "google") {
    authConfig = {
      provider: "google",
      clientId: process.env.BETTER_AUTH_CLIENT_ID,
      clientSecret: process.env.BETTER_AUTH_CLIENT_SECRET,
      callbackUrl: process.env.BETTER_AUTH_CALLBACK_URL,
      scope: process.env.BETTER_AUTH_SCOPE ?? "openid email profile",
    };
  } else {
    // Generic provider shape: libraries vary; override if needed for other
    // providers (github, etc.) by editing this file.
    authConfig = {
      provider,
      clientId: process.env.BETTER_AUTH_CLIENT_ID,
      clientSecret: process.env.BETTER_AUTH_CLIENT_SECRET,
      callbackUrl: process.env.BETTER_AUTH_CALLBACK_URL,
    };
  }
}

export const auth = betterAuth(authConfig);

export function isAuthConfigured() {
  return process.env.BETTER_AUTH_ENABLED === "1";
}

export async function getSession(req?: unknown) {
  return auth.getSession(req as any);
}

export async function requireSession(req?: unknown) {
  const session = await auth.requireSession(req as any);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireTeacherSession(req?: unknown) {
  const session = await requireSession(req);
  const users = await graphqlApi.listUsers().catch(() => []);
  const teacher = (users || []).find(
    (t: any) => String(t.id) === String(session.userId) || t.email === (session as any).user?.email
  );
  if (!teacher) throw new Error("Unauthorized: not a teacher");
  return teacher;
}

export async function requireEnrollerSession(req?: unknown) {
  const session = await requireSession(req);
  const users = await graphqlApi.listUsers().catch(() => []);
  const enroller = (users || []).find(
    (e: any) => String(e.id) === String(session.userId) || e.email === (session as any).user?.email
  );
  if (!enroller) throw new Error("Unauthorized: not an enroller");
  return enroller;
}

export function signInUrl(opts?: any) {
  if (isAuthConfigured()) return auth.signInUrl(opts);
  return "/login";
}

export function signOutUrl(opts?: any) {
  if (isAuthConfigured()) return auth.signOutUrl(opts);
  return process.env.BETTER_AUTH_SIGNOUT_URL || "/logout";
}
