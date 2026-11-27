
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/supabase";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* Hero Banner */}
      <section className="relative overflow-hidden px-6 py-12 md:py-16">
        {/* Efek blur abu-abu */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white px-7 py-10 shadow-[0_12px_40px_rgba(15,23,42,0.08)] md:px-14 md:py-14">
          {/* Hiasan blur biru */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-100/80 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-slate-200/70 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Laboratorium Desain Komunikasi Visual
            </p>

            <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Temukan Alat Laboratorium DKV
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 md:text-base">
              Cari perlengkapan praktikum dan ajukan peminjaman
              dengan mudah melalui AlatDKV.
            </p>

            <div className="mt-7">
              <Link
                href="/alat"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Jelajahi Alat
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Alat */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Koleksi Laboratorium
            </p>

            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Alat Laboratorium
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Temukan alat yang kamu butuhkan untuk kegiatanmu.
            </p>
          </div>

          <Link
            href="/alat"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Lihat semua alat
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
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
      <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Gagal mengambil data alat: {error.message}
      </p>
    );
  }

  if (!alat || alat.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
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
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {alat.map((item) => (
        <Link
          key={item.id}
          href={`/alat/${item.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
        >
          {/* Bagian atas kartu */}
          <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
            <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-blue-200/40 transition duration-300 group-hover:scale-125" />

            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-blue-100/70" />

            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white bg-white/80 text-xl font-bold text-blue-700 shadow-sm transition duration-300 group-hover:scale-110">
              {item.nama?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>

          {/* Informasi alat */}
          <div className="flex flex-1 flex-col p-5">
            <span className="mb-2 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
              {item.kategori}
            </span>

            <h3 className="text-lg font-bold text-slate-800 transition group-hover:text-blue-700">
              {item.nama}
            </h3>

            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
              {item.keterangan || "Tidak ada keterangan."}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="text-xs text-slate-400">
                  Stok tersedia
                </p>

                <p className="mt-1 text-base font-bold text-slate-800">
                  {item.stok}
                  <span className="ml-1 text-xs font-medium text-slate-500">
                    unit
                  </span>
                </p>
              </div>

              <span className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
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
