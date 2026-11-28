
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { createAdminClient } from "../../../lib/supabase/admin";
import { getAdminSession } from "../../../lib/supabase/auth/admin";

import {
  tambahAlat,
  ubahAlat,
  ubahStatusAlat,
  hapusAlat,
} from "./actions";

import ConfirmDeleteButton from "./confirmdeletebutton";

type Props = {
  searchParams: Promise<{
    pesan?: string;
    error?: string;
  }>;
};

const kategoriAlat = [
  { value: "kamera", label: "Kamera" },
  { value: "pencahayaan", label: "Pencahayaan" },
  { value: "audio", label: "Audio" },
  { value: "tablet", label: "Tablet" },
  { value: "aksesori", label: "Aksesori" },
];

export default function AdminAlatPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <div className="rounded-xl border bg-white p-6 text-slate-500">
              Memuat pengelolaan alat...
            </div>
          }
        >
          <KontenAdminAlat searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function KontenAdminAlat({ searchParams }: Props) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const pesan = typeof params.pesan === "string" ? params.pesan : "";
  const pesanError = typeof params.error === "string" ? params.error : "";

  const supabase = createAdminClient();

  // Mengambil semua alat, termasuk yang nonaktif.
  const { data: alat, error } = await supabase
    .from("alat")
    .select("id, nama, kategori, stok, keterangan, aktif")
    .order("id");

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="font-semibold text-red-600">
          Gagal mengambil data alat.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {error.message}
        </p>
      </div>
    );
  }

  // Mengambil jumlah unit yang masih dipinjam.
  const { data: peminjaman, error: errorPeminjaman } = await supabase
    .from("peminjaman_alat")
    .select("alat_id, jumlah")
    .eq("status", "dipinjam");

  if (errorPeminjaman) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-red-600">
          Gagal menghitung stok alat: {errorPeminjaman.message}
        </p>
      </div>
    );
  }

  const jumlahDipinjam = new Map<number, number>();

  (peminjaman ?? []).forEach((item) => {
    const id = Number(item.alat_id);
    const sebelumnya = jumlahDipinjam.get(id) ?? 0;

    jumlahDipinjam.set(id, sebelumnya + Number(item.jumlah));
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Kembali ke Dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-slate-800">
            Kelola Alat
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Tambahkan, ubah, dan atur ketersediaan alat laboratorium.
          </p>
        </div>
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

      {/* Form tambah alat */}
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Tambah Alat Baru
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Isi informasi alat yang akan ditambahkan.
        </p>

        <form action={tambahAlat} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nama-baru"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nama Alat
              </label>

              <input
                id="nama-baru"
                name="nama"
                type="text"
                minLength={3}
                maxLength={40}
                required
                placeholder="Masukkan nama alat"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="kategori-baru"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kategori
              </label>

              <select
                id="kategori-baru"
                name="kategori"
                required
                defaultValue=""
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="" disabled>
                  Pilih kategori
                </option>

                {kategoriAlat.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="stok-baru"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Jumlah Stok
              </label>

              <input
                id="stok-baru"
                name="stok"
                type="number"
                min="0"
                max="50"
                required
                defaultValue="0"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="keterangan-baru"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Keterangan
            </label>

            <textarea
              id="keterangan-baru"
              name="keterangan"
              rows={3}
              placeholder="Masukkan keterangan alat"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Tambahkan Alat
          </button>
        </form>
      </section>

      {/* Daftar alat */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            Daftar Alat Laboratorium
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Total {alat?.length ?? 0} alat terdaftar.
          </p>
        </div>

        {alat && alat.length > 0 ? (
          <div className="space-y-5">
            {alat.map((item) => {
              const dipinjam =
                jumlahDipinjam.get(Number(item.id)) ?? 0;

              const tersedia = Math.max(
                0,
                Number(item.stok) - dipinjam
              );

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {item.nama}
                      </h3>

                      <p className="mt-1 text-sm capitalize text-slate-500">
                        {item.kategori}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.aktif
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Stok keseluruhan
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {item.stok}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Sedang dipinjam
                      </p>
                      <p className="mt-1 text-xl font-bold text-blue-700">
                        {dipinjam}
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs text-blue-700">
                        Stok tersedia
                      </p>
                      <p className="mt-1 text-xl font-bold text-blue-800">
                        {tersedia}
                      </p>
                    </div>
                  </div>

                  {/* Form edit alat */}
                  <form
                    action={ubahAlat}
                    className="space-y-4 border-t border-slate-100 pt-5"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />

                    <h4 className="font-semibold text-slate-800">
                      Ubah Informasi Alat
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`nama-${item.id}`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Nama Alat
                        </label>

                        <input
                          id={`nama-${item.id}`}
                          name="nama"
                          type="text"
                          minLength={3}
                          maxLength={40}
                          required
                          defaultValue={item.nama}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`kategori-${item.id}`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Kategori
                        </label>

                        <select
                          id={`kategori-${item.id}`}
                          name="kategori"
                          required
                          defaultValue={item.kategori}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                        >
                          {kategoriAlat.map((kategori) => (
                            <option
                              key={kategori.value}
                              value={kategori.value}
                            >
                              {kategori.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`stok-${item.id}`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Stok Keseluruhan
                        </label>

                        <input
                          id={`stok-${item.id}`}
                          name="stok"
                          type="number"
                          min="0"
                          max="50"
                          required
                          defaultValue={item.stok}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                        />

                        <p className="mt-1 text-xs text-slate-500">
                          Minimal stok yang boleh diisi: {dipinjam} unit.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`keterangan-${item.id}`}
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Keterangan
                      </label>

                      <textarea
                        id={`keterangan-${item.id}`}
                        name="keterangan"
                        rows={2}
                        defaultValue={item.keterangan ?? ""}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      Simpan Perubahan
                    </button>
                  </form>

                  {/* Form status aktif dan hapus */}
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <form action={ubahStatusAlat}>
                      <input
                        type="hidden"
                        name="id"
                        value={item.id}
                      />

                      <input
                        type="hidden"
                        name="aktif"
                        value={item.aktif ? "false" : "true"}
                      />

                      <button
                        type="submit"
                        className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        {item.aktif
                          ? "Nonaktifkan Alat"
                          : "Aktifkan Alat"}
                      </button>
                    </form>

                    <form action={hapusAlat}>
                      <input
                        type="hidden"
                        name="id"
                        value={item.id}
                      />

                      <ConfirmDeleteButton />
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-slate-500">
              Belum ada data alat.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
