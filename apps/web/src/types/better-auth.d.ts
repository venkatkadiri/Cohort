declare module "better-auth" {
  export type Session = {
    userId?: string;
    email?: string;
    name?: string;
  } | null;
  export function betterAuth(config?: any): {
    getSession: (req?: any) => Promise<Session>;
    requireSession: (req?: any) => Promise<Session>;
    signInUrl: (opts?: any) => string;
    signOutUrl: (opts?: any) => string;
  };
  export default function betterAuth(config?: any): {
    getSession: (req?: any) => Promise<Session>;
    requireSession: (req?: any) => Promise<Session>;
    signInUrl: (opts?: any) => string;
    signOutUrl: (opts?: any) => string;
  };
}
