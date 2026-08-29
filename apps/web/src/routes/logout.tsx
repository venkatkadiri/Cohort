import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="page-wrap flex min-h-[50vh] items-center justify-center text-sm text-[var(--sea-ink-soft)]">
      Signing out and redirecting to home…
    </div>
  );
}
