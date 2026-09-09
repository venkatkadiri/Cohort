import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { listUsers } from "../server/functions/users.fn";
import { initials } from "../lib/format";

const STORAGE_KEY = "cohort:hostId";

export function getStoredHostId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

export function setStoredHostId(id: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(id));
}

type User = Awaited<ReturnType<typeof listUsers>>[number];

export default function HostSwitcher() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listUsers()
      .then((fetched) => {
        setUsers(fetched ?? []);
        setCurrentId(getStoredHostId());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = users.find((user) => user.id === currentId);

  if (loading) {
    return (
      <span className="inline-flex h-9 w-32 animate-pulse items-center rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)]" />
    );
  }

  if (users.length === 0) {
    return null;
  }

  function selectUser(user: User) {
    setCurrentId(user.id);
    setStoredHostId(user.id);
    setOpen(false);
    navigate({
      to: "/users/$userId",
      params: { userId: String(user.id) },
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#56c6be,#2f6a4a)] text-[10px] font-bold text-white">
          {current ? initials(current.name) : "•"}
        </span>
        <span className="hidden max-w-32 truncate sm:block">
          {current ? current.name : "Pick a host"}
        </span>
        <span className="text-[10px] text-[var(--sea-ink-soft)]">▾</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--chip-line)] bg-[var(--surface-strong)] shadow-xl backdrop-blur-lg">
          <p className="island-kicker px-4 pb-1 pt-3">Manage as host</p>
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => selectUser(user)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-[var(--link-bg-hover)] ${
                    user.id === currentId
                      ? "bg-[var(--link-bg-hover)] text-[var(--sea-ink)]"
                      : "text-[var(--sea-ink-soft)]"
                  }`}
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#56c6be,#2f6a4a)] text-[10px] font-bold text-white">
                    {initials(user.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[var(--sea-ink)]">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--sea-ink-soft)]">
                      /{user.slug}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
