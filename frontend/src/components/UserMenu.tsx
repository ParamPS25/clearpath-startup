"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogoutIcon, MailIcon } from "./icons";

export default function UserMenu() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuState, setMenuState] = useState({ open: false, pathname });

  // Same render-time adjustment as the mobile nav menu in Header.tsx - close
  // whenever the route actually changes, without a set-state-in-effect.
  if (menuState.pathname !== pathname) {
    setMenuState({ open: false, pathname });
  }
  const open = menuState.open;
  const setOpen = (next: boolean) => setMenuState({ open: next, pathname });

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const email = session?.user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-1.5 flex flex-col gap-0.5"
        >
          <div className="flex items-center gap-2 px-2.5 py-2 text-sm text-gray-500 dark:text-gray-400">
            <MailIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800" />
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <LogoutIcon className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
