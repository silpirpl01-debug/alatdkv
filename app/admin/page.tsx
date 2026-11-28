
import AdminActions from "./adminactions";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "../../lib/supabase/admin";
import { getAdminSession } from "../../lib/supabase/auth/admin";
import { logoutAdmin } from "../login/actions";

type Props = {
  searchParams: Promise<{
    status?: string;
    pesan?: string;
    error?: string;
  }>;
};

const filterStatus = [
  { value: "semua", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "terlambat", label: "Terlambat" },
  { value: "dikembalikan", label: "Dikembalikan" },
  { value: "ditolak", label: "Ditolak" },
];

function tanggalJakarta() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const ambil = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${ambil("year")}-${ambil("month")}-${ambil("day")}`;
}

export default function AdminPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <div className="rounded-xl border bg-white p-6 text-slate-500">
              Memuat dashboard admin...
            </div>
          }
        >
          <KontenAdmin searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function KontenAdmin({ searchParams }: Props) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  const pesan =
    typeof params.pesan === "string" ? params.pesan : "";

  const pesanError =
    typeof params.error === "string" ? params.error : "";

  const statusDipilih = filterStatus.some(
    (item) => item.value === params.status
  )
    ? params.status!
    : "semua";

  const supabase = createAdminClient();

  // Mengambil seluruh permohonan peminjaman.
  const { data: pengajuan, error } = await supabase
    .from("peminjaman_alat")
    .select(
      "id, alat_id, peminjam, kelas, keperluan, jumlah, tgl_pinjam, tgl_kembali, status, alasan_tolak, kondisi_kembali, tgl_dikembalikan, dibuat"
    )
    .order("dibuat", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="font-semibold text-red-600">
          Gagal mengambil data peminjaman.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {error.message}
        </p>
      </div>
    );
  }

  // Mengambil nama alat berdasarkan ID alat.
  const daftarIdAlat = [
    ...new Set((pengajuan ?? []).map((item) => Number(item.alat_id))),
  ];

  const namaAlat = new Map<number, string>();

  if (daftarIdAlat.length > 0) {
    const { data: daftarAlat, error: errorAlat } = await supabase
      .from("alat")
      .select("id, nama")
      .in("id", daftarIdAlat);

    if (errorAlat) {
      return (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <p className="text-red-600">
            Gagal mengambil nama alat: {errorAlat.message}
          </p>
        </div>
      );
    }

    (daftarAlat ?? []).forEach((item) => {
      namaAlat.set(Number(item.id), item.nama);
    });
  }

  const hariIni = tanggalJakarta();

  // Menentukan status terlambat.
  const semuaPengajuan = (pengajuan ?? []).map((item) => {
    const terlambat =
      item.status === "dipinjam" &&
      item.tgl_kembali < hariIni;

    return {
      ...item,
      terlambat,
      namaAlat:
        namaAlat.get(Number(item.alat_id)) ?? "Alat tidak ditemukan",
    };
  });

  // Menyaring daftar berdasarkan status.
  const dataTampil = semuaPengajuan.filter((item) => {
    if (statusDipilih === "semua") return true;

    if (statusDipilih === "terlambat") {
      return item.terlambat;
    }

    return item.status === statusDipilih;
  });

  function labelStatus(item: (typeof semuaPengajuan)[number]) {
    if (item.terlambat) return "Terlambat";

    switch (item.status) {
      case "menunggu":
        return "Menunggu";
      case "dipinjam":
        return "Dipinjam";
      case "dikembalikan":
        return "Dikembalikan";
      case "ditolak":
        return "Ditolak";
      default:
        return item.status;
    }
  }

  function warnaStatus(item: (typeof semuaPengajuan)[number]) {
    if (item.terlambat) {
      return "bg-red-50 text-red-700";
    }

    switch (item.status) {
      case "menunggu":
        return "bg-yellow-50 text-yellow-700";
      case "dipinjam":
        return "bg-blue-50 text-blue-700";
      case "dikembalikan":
        return "bg-green-50 text-green-700";
      case "ditolak":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <>
      {/* Header dashboard */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-700">
            AlatDKV
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Dashboard Admin
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola permohonan peminjaman alat laboratorium DKV.
          </p>
        </div>

        <form action={logoutAdmin}>
          <button
            type="submit"
            className="rounded-lg border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            Keluar
          </button>
        </form>
      </div>

      {/* Pesan berhasil */}
      {pesan && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {pesan}
        </div>
      )}

      {/* Pesan error */}
      {pesanError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {pesanError}
        </div>
      )}

      {/* Ringkasan */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pengajuan</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {semuaPengajuan.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Menunggu</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {semuaPengajuan.filter((item) => item.status === "menunggu").length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Sedang Dipinjam</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {semuaPengajuan.filter((item) => item.status === "dipinjam").length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Terlambat</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {semuaPengajuan.filter((item) => item.terlambat).length}
          </p>
        </div>
      </div>

      {/* Daftar permohonan */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            Daftar Permohonan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Lihat dan saring semua permohonan peminjaman.
          </p>
        </div>

        {/* Filter status */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterStatus.map((item) => (
            <Link
              key={item.value}
              href={
                item.value === "semua"
                  ? "/admin"
                  : `/admin?status=${item.value}`
              }
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                statusDipilih === item.value
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {dataTampil.length > 0 ? (
          <div className="space-y-4">
            {dataTampil.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Nomor Pengajuan #{item.id}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-800">
                      {item.namaAlat}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.peminjam} · {item.kelas}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${warnaStatus(item)}`}
                  >
                    {labelStatus(item)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-slate-400">Jumlah</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {item.jumlah} unit
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Tanggal Pinjam</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {item.tgl_pinjam}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Tanggal Kembali</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {item.tgl_kembali}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Keperluan
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {item.keperluan}
                  </p>
                </div>

                {item.alasan_tolak && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700">
                      Alasan Penolakan
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {item.alasan_tolak}
                    </p>
                  </div>
                )}

                {/* Tombol tindakan admin */}
                <AdminActions
                  id={Number(item.id)}
                  status={item.status}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-10 text-center">
            <p className="font-semibold text-slate-700">
              Belum ada permohonan
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Tidak ada data pada filter yang dipilih.
            </p>
          </div>
        )}
      </section>

      <div className="mt-6 flex justify-end">
        <Link
          href="/admin/alat"
          className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Kelola Alat
        </Link>
      </div>
    </>
  );
}
