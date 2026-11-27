
import {
  serahkanPeminjaman,
  tolakPeminjaman,
  kembalikanPeminjaman,
} from "./actions";

type Props = {
  id: number;
  status: string;
};

export default function AdminActions({ id, status }: Props) {
  if (status === "menunggu") {
    return (
      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
        <form action={serahkanPeminjaman}>
          <input type="hidden" name="id" value={id} />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Serahkan Alat
          </button>
        </form>

        <form action={tolakPeminjaman} className="space-y-2">
          <input type="hidden" name="id" value={id} />

          <label
            htmlFor={`alasan-${id}`}
            className="block text-sm font-semibold text-slate-700"
          >
            Alasan Penolakan
          </label>

          <textarea
            id={`alasan-${id}`}
            name="alasan"
            minLength={5}
            required
            rows={2}
            placeholder="Masukkan alasan penolakan"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Tolak Pengajuan
          </button>
        </form>
      </div>
    );
  }

  if (status === "dipinjam") {
    return (
      <form
        action={kembalikanPeminjaman}
        className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="id" value={id} />

        <div className="flex-1">
          <label
            htmlFor={`kondisi-${id}`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Kondisi Saat Dikembalikan
          </label>

          <select
            id={`kondisi-${id}`}
            name="kondisi"
            required
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
          >
            <option value="" disabled>
              Pilih kondisi alat
            </option>
            <option value="baik">Baik</option>
            <option value="rusak ringan">Rusak Ringan</option>
            <option value="rusak berat">Rusak Berat</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          Catat Pengembalian
        </button>
      </form>
    );
  }

  return null;
}
