import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/supabase";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-medium tracking-wider text-blue-100">
            LABORATORIUM DESAIN KOMUNIKASI VISUAL
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Pinjam alat laboratorium DKV dengan mudah
          </h1>

          <p className="mt-5 max-w-xl text-blue-100">
            Temukan alat yang kamu butuhkan untuk praktikum,
            tugas, dan kegiatan kreatif. Ajukan peminjaman
            dengan mudah melalui AlatDKV.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/alat"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Lihat Daftar Alat
            </Link>

            <Link
              href="/status"
              className="rounded-lg border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Cek Status Peminjaman
            </Link>
          </div>
        </div>
      </section>

      {/* Informasi */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              Pilih Alat
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Lihat daftar alat laboratorium dan ketersediaan stok.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              Ajukan Peminjaman
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Isi formulir peminjaman sesuai kebutuhan kegiatanmu.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              Pantau Status
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Pantau pengajuan dan status pengembalian alat.
            </p>
          </div>
        </div>
      </section>

      {/* Daftar alat */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Alat Laboratorium
            </h2>

            <p className="mt-1 text-slate-500">
              Daftar alat yang tersedia untuk digunakan.
            </p>
          </div>

          <Link
            href="/alat"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat semua →
          </Link>
        </div>

        <Suspense
          fallback={
            <p className="rounded-xl border bg-white p-6 text-slate-500">
              Memuat data alat...
            </p>
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
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        Gagal mengambil data alat: {error.message}
      </p>
    );
  }

  if (!alat || alat.length === 0) {
    return (
      <p className="rounded-xl border bg-white p-6 text-slate-500">
        Belum ada alat yang tersedia.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alat.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="font-bold text-slate-800">
            {item.nama}
          </h3>

          <p className="mt-1 text-sm capitalize text-slate-500">
            {item.kategori}
          </p>

          <p className="mt-3 text-sm text-slate-600">
            Stok tersedia:{" "}
            <span className="font-semibold text-blue-700">
              {item.stok}
            </span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {item.keterangan || "Tidak ada keterangan."}
          </p>
        </div>
      ))}
    </div>
  );
}