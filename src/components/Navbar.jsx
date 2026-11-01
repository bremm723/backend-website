"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/dashboard", label: "Roadmap", emoji: "🗺️" },
  { href: "/overview", label: "Materi", emoji: "📚" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, displayName, heartsTotal, currentLevel, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-pink-200/70 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="group flex items-center gap-2 font-black tracking-tight text-rose-600">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md transition-transform group-hover:scale-110">
            n.
          </span>
          <span className="hidden text-lg sm:block">
            nduttt<span className="text-pink-400">.be</span>
          </span>
        </Link>

        <div className="ml-1 flex items-center gap-1 rounded-full bg-pink-50 p-1">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active ? "bg-white text-rose-600 shadow-sm" : "text-rose-500/70 hover:text-rose-600"
                }`}
              >
                <span className="mr-1">{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-3 text-sm font-semibold text-rose-600 sm:flex">
                <span className="rounded-full bg-rose-100 px-3 py-1">Lv {currentLevel > 5 ? 5 : currentLevel}</span>
                <span className="rounded-full bg-pink-100 px-3 py-1">💖 {heartsTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-rose-700 sm:inline">{displayName}</span>
                <button
                  onClick={logout}
                  className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500 hover:text-white"
                >
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
            >
              Masuk 💕
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
