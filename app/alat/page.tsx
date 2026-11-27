
import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "../../lib/supabase/admin";

const kategoriAlat = [
  { value: "kamera", label: "Kamera" },
  { value: "pencahayaan", label: "Pencahayaan" },
  { value: "audio", label: "Audio" },
  { value: "tablet", label: "Tablet" },
  { value: "aksesori", label: "Aksesori" },
];

type Props = {
  searchParams: Promise<{
    kategori?: string | string[];
  }>;
};

export default function Page({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <div className="rounded-xl border bg-white p-6 text-slate-500">
              Memuat data alat...
            </div>
          }
        >
          <KontenAlat searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function KontenAlat({ searchParams }: Props) {
  const params = await searchParams;
  const nilaiKategori = params.kategori;

  const kategoriDipilih =
    typeof nilaiKategori === "string" &&
    kategoriAlat.some((item) => item.value === nilaiKategori)
      ? nilaiKategori
      : "";

  const supabase = createAdminClient();

  // Mengambil alat yang masih aktif.
  let queryAlat = supabase
    .from("alat")
    .select("id, nama, kategori, stok, keterangan, aktif")
    .eq("aktif", true)
    .order("id");

  // Filter berdasarkan kategori dari URL.
  if (kategoriDipilih) {
    queryAlat = queryAlat.eq("kategori", kategoriDipilih);
  }

  // Mengambil alat dan jumlah yang sedang dipinjam.
  const [hasilAlat, hasilPeminjaman] = await Promise.all([
    queryAlat,
    supabase
      .from("peminjaman_alat")
      .select("alat_id, jumlah")
      .eq("status", "dipinjam"),
  ]);

  if (hasilAlat.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="font-medium text-red-600">
          Gagal mengambil data alat.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {hasilAlat.error.message}
        </p>
      </div>
    );
  }

  if (hasilPeminjaman.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="font-medium text-red-600">
          Gagal menghitung stok tersedia.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {hasilPeminjaman.error.message}
        </p>
      </div>
    );
  }

  const alat = hasilAlat.data ?? [];
  const peminjaman = hasilPeminjaman.data ?? [];

  // Menghitung jumlah unit yang masih dipinjam untuk setiap alat.
  const jumlahDipinjam = new Map<number, number>();

  peminjaman.forEach((item) => {
    const idAlat = Number(item.alat_id);
    const jumlah = Number(item.jumlah);

    const sebelumnya = jumlahDipinjam.get(idAlat) ?? 0;

    jumlahDipinjam.set(idAlat, sebelumnya + jumlah);
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Daftar Alat Laboratorium
        </h1>

        <p className="mt-2 text-slate-500">
          Temukan alat laboratorium DKV yang tersedia untuk
          kebutuhan praktikum dan kegiatan kreatif.
        </p>
      </div>

      {/* Filter kategori */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/alat"
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            kategoriDipilih === ""
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-700"
          }`}
        >
          Semua
        </Link>

        {kategoriAlat.map((kategori) => (
          <Link
            key={kategori.value}
            href={`/alat?kategori=${kategori.value}`}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              kategoriDipilih === kategori.value
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-700"
            }`}
          >
            {kategori.label}
          </Link>
        ))}
      </div>

      {/* Kartu daftar alat */}
      {alat.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {alat.map((item) => {
            const stok = Number(item.stok);
            const dipinjam =
              jumlahDipinjam.get(Number(item.id)) ?? 0;

            const tersedia = Math.max(0, stok - dipinjam);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {item.nama}
                    </h2>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {item.kategori}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      tersedia > 0
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {tersedia > 0 ? "Tersedia" : "Habis"}
                  </span>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500">
                    Jumlah tersedia
                  </p>

                  <p className="mt-1 text-3xl font-bold text-blue-700">
                    {tersedia}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      unit
                    </span>
                  </p>
                </div>

                <p className="mt-4 min-h-10 text-sm leading-relaxed text-slate-500">
                  {item.keterangan || "Tidak ada keterangan alat."}
                </p>

                <Link
                  href={`/alat/${item.id}`}
                  className="mt-5 block rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Lihat Detail
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-700">
            Belum ada alat tersedia
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Belum ada alat aktif pada kategori ini.
          </p>
        </div>
      )}
    </>
  );
}
