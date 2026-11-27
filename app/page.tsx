
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/supabase";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 px-6 py-20 text-white md:py-24">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Laboratorium Desain Komunikasi Visual
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Temukan dan pinjam alat laboratorium DKV
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
            Temukan berbagai perlengkapan untuk mendukung praktikum,
            tugas, dan kegiatan kreatifmu. Lihat ketersediaan alat
            dan ajukan peminjaman dengan mudah melalui AlatDKV.
          </p>

          <div className="mt-9">
            <Link
              href="/alat"
              className="inline-flex items-center gap-3 rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Jelajahi Alat
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Daftar alat */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Koleksi Laboratorium
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Alat Laboratorium
            </h2>

            <p className="mt-2 text-slate-500">
              Temukan alat yang kamu butuhkan untuk kegiatanmu.
            </p>
          </div>

          <Link
            href="/alat"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Lihat semua alat
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
              Memuat data alat...
            </div>
          }
        >
          <DaftarAlat />
        </Suspense>
      </section>
    </main>
  );
}

async function DaftarAlat() {
  const supabase = await createClient();

  const { data: alat, error } = await supabase
    .from("alat")
    .select("*")
    .eq("aktif", true)
    .order("id");

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
        Gagal mengambil data alat: {error.message}
      </p>
    );
  }

  if (!alat || alat.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <h3 className="font-semibold text-slate-800">
          Belum ada alat tersedia
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Daftar alat laboratorium belum memiliki data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {alat.map((item) => (
        <Link
          key={item.id}
          href={`/alat/${item.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
        >
          <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
            <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-blue-200/40 transition duration-300 group-hover:scale-125" />
            <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-blue-100/70" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white/80 text-2xl font-bold text-blue-700 shadow-sm transition duration-300 group-hover:scale-110">
              {item.nama?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <span className="mb-3 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
              {item.kategori}
            </span>

            <h3 className="text-xl font-bold text-slate-800 transition group-hover:text-blue-700">
              {item.nama}
            </h3>

            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
              {item.keterangan || "Tidak ada keterangan."}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400">
                  Stok tersedia
                </p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {item.stok}
                  <span className="ml-1 text-sm font-medium text-slate-500">
                    unit
                  </span>
                </p>
              </div>

              <span className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                Detail
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
