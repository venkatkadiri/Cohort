// Client-safe auth helpers that never import server-side better-auth or database adapters

export function isAuthConfigured(): boolean {
  if (typeof window !== "undefined") {
    return (window as any).__BETTER_AUTH_ENABLED__ === "1";
  }
  return process.env.BETTER_AUTH_ENABLED === "1";
}

export function signInUrl(opts?: { callbackUrl?: string }): string {
  if (isAuthConfigured()) {
    const cb = opts?.callbackUrl ? `?callbackUrl=${encodeURIComponent(opts.callbackUrl)}` : "";
    return `/api/auth/signin${cb}`;
  }
  return "/login";
}

export function signOutUrl(): string {
  return "/logout";
}
