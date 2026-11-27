
"use client";

import { useActionState, useState } from "react";
import {
  cekStatusPeminjaman,
  type CekState,
} from "./actions";

const initialState: CekState = {
  status: "idle",
};

export default function FormCek() {
  const [state, formAction, pending] = useActionState(
    cekStatusPeminjaman,
    initialState
  );

  const [nomor, setNomor] = useState("");
  const [nama, setNama] = useState("");

  const hasil = state.hasil;

  const statusTampil = hasil?.terlambat
    ? "Terlambat"
    : hasil?.status === "menunggu"
      ? "Menunggu"
      : hasil?.status === "dipinjam"
        ? "Sedang Dipinjam"
        : hasil?.status === "dikembalikan"
          ? "Dikembalikan"
          : hasil?.status === "ditolak"
            ? "Ditolak"
            : "-";

  const warnaStatus = hasil?.terlambat
    ? "bg-red-50 text-red-700"
    : hasil?.status === "dikembalikan"
      ? "bg-green-50 text-green-700"
      : hasil?.status === "ditolak"
        ? "bg-red-50 text-red-700"
        : "bg-blue-50 text-blue-700";

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-800">
            Cek Status Peminjaman
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Masukkan nomor pengajuan dan nama peminjam untuk melihat
            status peminjaman alat.
          </p>
        </div>

        {state.status === "error" && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {state.message}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label
              htmlFor="nomor"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nomor Pengajuan
            </label>

            <input
              id="nomor"
              name="nomor"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              required
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="Masukkan nomor pengajuan"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="nama"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nama Peminjam
            </label>

            <input
              id="nama"
              name="nama"
              type="text"
              minLength={3}
              maxLength={40}
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama sesuai pengajuan"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-7 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "Memeriksa..." : "Cek Status"}
        </button>
      </form>

      {state.status === "success" && hasil && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-800">
              Hasil Pengecekan
            </h2>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${warnaStatus}`}
            >
              {statusTampil}
            </span>
          </div>

          {hasil.terlambat && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Tanggal pengembalian sudah lewat, tetapi alat masih
              tercatat dipinjam.
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Nomor Pengajuan</p>
              <p className="mt-1 font-semibold text-slate-800">
                {hasil.nomor}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Nama Peminjam</p>
              <p className="mt-1 font-semibold text-slate-800">
                {hasil.nama}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Nama Alat</p>
              <p className="mt-1 font-semibold text-slate-800">
                {hasil.namaAlat}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Jumlah Dipinjam</p>
              <p className="mt-1 font-semibold text-slate-800">
                {hasil.jumlah} unit
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Tanggal Pinjam</p>
              <p className="mt-1 font-semibold text-slate-800">
                {hasil.tglPinjam}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Tanggal Kembali</p>
              <p className="mt-1 font-semibold text-slate-800">
                {hasil.tglKembali}
              </p>
            </div>

            {hasil.tglDikembalikan && (
              <div>
                <p className="text-xs text-slate-500">
                  Tanggal Dikembalikan
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {hasil.tglDikembalikan}
                </p>
              </div>
            )}

            {hasil.kondisiKembali && (
              <div>
                <p className="text-xs text-slate-500">
                  Kondisi Saat Dikembalikan
                </p>
                <p className="mt-1 font-semibold capitalize text-slate-800">
                  {hasil.kondisiKembali}
                </p>
              </div>
            )}
          </div>

          {hasil.alasanTolak && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Alasan Penolakan
              </p>

              <p className="mt-1 text-sm text-red-700">
                {hasil.alasanTolak}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
