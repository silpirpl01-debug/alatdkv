
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  submitPeminjaman,
  type ActionState,
  type FieldName,
} from "./action";

export type AlatOption = {
  id: string;
  nama: string;
  stok: number;
};

type Props = {
  alat: AlatOption[];
  initialAlatId: string;
  today: string;
  maxDate: string;
};

type FormValues = {
  alat_id: string;
  tgl_pinjam: string;
  tgl_kembali: string;
  jumlah: string;
  peminjam: string;
  kelas: string;
  keperluan: string;
};

const initialState: ActionState = {
  status: "idle",
};

function tambahHari(tanggal: string, jumlah: number) {
  if (!tanggal) return "";

  const date = new Date(`${tanggal}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + jumlah);

  return date.toISOString().slice(0, 10);
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

export default function FormAjukan({
  alat,
  initialAlatId,
  today,
  maxDate,
}: Props) {
  const [state, formAction, pending] = useActionState(
    submitPeminjaman,
    initialState
  );

  const [values, setValues] = useState<FormValues>({
    alat_id: initialAlatId,
    tgl_pinjam: "",
    tgl_kembali: "",
    jumlah: "1",
    peminjam: "",
    kelas: "",
    keperluan: "",
  });

  function ubahNilai(field: keyof FormValues, value: string) {
    setValues((sebelumnya) => ({
      ...sebelumnya,
      [field]: value,
    }));
  }

  function error(field: FieldName) {
    return state.fieldErrors?.[field];
  }

  const maxTanggalKembali = values.tgl_pinjam
    ? tambahHari(values.tgl_pinjam, 3)
    : maxDate;

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-green-700">
          Pengajuan Berhasil
        </h1>

        <p className="mt-3 text-slate-600">
          {state.message}
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">
            Nomor pengajuan kamu
          </p>

          <p className="mt-1 text-3xl font-bold text-blue-700">
            {state.requestId}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Simpan nomor ini untuk mengecek status peminjaman.
          </p>
        </div>

        <Link
          href="/alat"
          className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Kembali ke Daftar Alat
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">
          Formulir Peminjaman Alat
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Isi data berikut dengan benar untuk mengajukan peminjaman.
        </p>
      </div>

      {state.message && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="alat_id" className="mb-2 block text-sm font-semibold text-slate-700">
            Pilih Alat
          </label>

          <select
            id="alat_id"
            name="alat_id"
            required
            value={values.alat_id}
            onChange={(e) => ubahNilai("alat_id", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
          >
            {alat.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} (Stok {item.stok})
              </option>
            ))}
          </select>

          <ErrorText message={error("alat_id")} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tgl_pinjam" className="mb-2 block text-sm font-semibold text-slate-700">
              Tanggal Pinjam
            </label>

            <input
              id="tgl_pinjam"
              name="tgl_pinjam"
              type="date"
              required
              min={today}
              max={maxDate}
              value={values.tgl_pinjam}
              onChange={(e) => {
                ubahNilai("tgl_pinjam", e.target.value);

                if (
                  values.tgl_kembali &&
                  values.tgl_kembali < e.target.value
                ) {
                  ubahNilai("tgl_kembali", "");
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />

            <ErrorText message={error("tgl_pinjam")} />
          </div>

          <div>
            <label htmlFor="tgl_kembali" className="mb-2 block text-sm font-semibold text-slate-700">
              Tanggal Kembali
            </label>

            <input
              id="tgl_kembali"
              name="tgl_kembali"
              type="date"
              required
              min={values.tgl_pinjam || today}
              max={maxTanggalKembali}
              value={values.tgl_kembali}
              onChange={(e) => ubahNilai("tgl_kembali", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />

            <ErrorText message={error("tgl_kembali")} />
          </div>
        </div>

        <div>
          <label htmlFor="jumlah" className="mb-2 block text-sm font-semibold text-slate-700">
            Jumlah Alat
          </label>

          <input
            id="jumlah"
            name="jumlah"
            type="number"
            min="1"
            max="5"
            required
            value={values.jumlah}
            onChange={(e) => ubahNilai("jumlah", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />

          <ErrorText message={error("jumlah")} />
        </div>

        <div>
          <label htmlFor="peminjam" className="mb-2 block text-sm font-semibold text-slate-700">
            Nama Peminjam
          </label>

          <input
            id="peminjam"
            name="peminjam"
            type="text"
            minLength={3}
            maxLength={40}
            required
            value={values.peminjam}
            onChange={(e) => ubahNilai("peminjam", e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />

          <ErrorText message={error("peminjam")} />
        </div>

        <div>
          <label htmlFor="kelas" className="mb-2 block text-sm font-semibold text-slate-700">
            Kelas
          </label>

          <input
            id="kelas"
            name="kelas"
            type="text"
            minLength={3}
            maxLength={20}
            required
            value={values.kelas}
            onChange={(e) => ubahNilai("kelas", e.target.value)}
            placeholder="Contoh: XII DKV 1"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />

          <ErrorText message={error("kelas")} />
        </div>

        <div>
          <label htmlFor="keperluan" className="mb-2 block text-sm font-semibold text-slate-700">
            Keperluan Peminjaman
          </label>

          <textarea
            id="keperluan"
            name="keperluan"
            minLength={5}
            maxLength={120}
            required
            rows={4}
            value={values.keperluan}
            onChange={(e) => ubahNilai("keperluan", e.target.value)}
            placeholder="Tuliskan keperluan peminjaman alat"
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />

          <ErrorText message={error("keperluan")} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? "Menyimpan Pengajuan..." : "Kirim Pengajuan"}
      </button>

      <p className="mt-4 text-center text-xs text-slate-500">
        Pastikan semua data sudah benar sebelum dikirim.
      </p>
    </form>
  );
}
