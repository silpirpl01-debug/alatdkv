
import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "../../../lib/supabase/admin";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function Page({ params }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Suspense
          fallback={
            <div className="rounded-xl border bg-white p-6 text-slate-500">
              Memuat detail alat...
            </div>
          }
        >
          <DetailAlat params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function DetailAlat({ params }: Props) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return <TidakDitemukan />;
  }

  const supabase = createAdminClient();

  // Mengambil detail alat.
  const { data: alat, error } = await supabase
    .from("alat")
    .select("id, nama, kategori, stok, keterangan, aktif")
    .eq("id", id)
    .eq("aktif", true)
    .maybeSingle();

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-red-600">
          Gagal mengambil detail alat: {error.message}
        </p>
      </div>
    );
  }

  if (!alat) {
    return <TidakDitemukan />;
  }

  // Mengambil jumlah alat yang sedang dipinjam.
  const { data: peminjaman, error: errorPeminjaman } =
    await supabase
      .from("peminjaman_alat")
      .select("jumlah")
      .eq("alat_id", id)
      .eq("status", "dipinjam");

  if (errorPeminjaman) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-red-600">
          Gagal menghitung stok tersedia.
        </p>
      </div>
    );
  }

  const totalDipinjam = (peminjaman ?? []).reduce(
    (total, item) => total + Number(item.jumlah),
    0
  );

  const stok = Number(alat.stok);
  const tersedia = Math.max(0, stok - totalDipinjam);

  return (
    <>
      <Link
        href="/alat"
        className="mb-6 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
      >
        ← Kembali ke Daftar Alat
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
              Detail Alat Laboratorium
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-800">
              {alat.nama}
            </h1>

            <p className="mt-2 text-sm capitalize text-slate-500">
              Kategori: {alat.kategori}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tersedia > 0
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {tersedia > 0 ? "Tersedia" : "Stok Habis"}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Stok keseluruhan
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800">
              {stok}
              <span className="ml-2 text-sm font-normal text-slate-500">
                unit
              </span>
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-5">
            <p className="text-sm text-blue-700">
              Stok tersedia
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-800">
              {tersedia}
              <span className="ml-2 text-sm font-normal text-blue-700">
                unit
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="font-semibold text-slate-800">
            Keterangan Alat
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {alat.keterangan || "Tidak ada keterangan alat."}
          </p>
        </div>

        <div className="mt-8">
          {tersedia > 0 ? (
            <Link
              href={`/ajukan?alat_id=${alat.id}`}
              className="block rounded-lg bg-blue-700 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
            >
              Ajukan Peminjaman
            </Link>
          ) : (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-slate-200 px-6 py-3 font-semibold text-slate-500"
            >
              Stok Tidak Tersedia
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function TidakDitemukan() {
  return (
    <div className="rounded-xl border bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-slate-800">
        Alat Tidak Ditemukan
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Alat tidak tersedia atau sudah dinonaktifkan.
      </p>

      <Link
        href="/alat"
        className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
      >
        Kembali ke Daftar Alat
      </Link>
    </div>
  );
}
