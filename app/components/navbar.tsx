
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const menu = [
    { nama: "Beranda", href: "/" },
    { nama: "Daftar Alat", href: "/alat" },
    { nama: "Cek Status", href: "/cek" },
    { nama: "Admin", href: "/login" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-6 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 py-4">
        <Link href="/" className="shrink-0">
          <span className="text-2xl font-bold tracking-tight text-blue-700">
            AlatDKV
          </span>
        </Link>

        <div className="flex items-center gap-2 overflow-x-auto">
          {menu.map((item) => {
            const aktif =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-base font-semibold transition duration-200 ${
                  aktif
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {item.nama}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
