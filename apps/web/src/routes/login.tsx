import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { localSignInFn } from "../server/functions/auth.fn";
import { isAuthConfigured, signInUrl } from "../lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"teacher" | "enroller">("enroller");
  const [error, setError] = useState<string | null>(null);

  async function handleLocalSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await localSignInFn({ data: { email, role } });
      // store simple session for demo purposes
      window.localStorage.setItem("demoSession", JSON.stringify(res));
      if (res.role === "teacher") window.location.href = "/teachers";
      else window.location.href = "/enrollers";
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  return (
    <div className="page-wrap px-4 pb-16 pt-14">
      <h1 className="display-title">Sign in</h1>
      <p className="mt-2 text-sm">
        Sign in with your account (teachers or enrollers only).
      </p>

      <section className="mt-6 max-w-md">
        {isAuthConfigured() ? (
          <div className="mb-6">
            <a href={signInUrl()} className="btn btn-primary">
              Sign in with provider
            </a>
          </div>
        ) : null}
        <form onSubmit={handleLocalSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              className="mt-1 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="enroller">Enroller (student)</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Sign in (dev)
            </button>
            <a href="/" className="btn btn-ghost">
              Cancel
            </a>
          </div>
        </form>
      </section>
    </div>
  );
}
