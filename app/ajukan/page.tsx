
import { Suspense } from "react";
import { createAdminClient } from "../../lib/supabase/admin";
import FormAjukan, { type AlatOption } from "./FormAjukan";

type Props = {
  searchParams: Promise<{
    alat_id?: string | string[];
  }>;
};

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

function tambahHari(tanggal: string, jumlah: number) {
  const date = new Date(`${tanggal}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + jumlah);
  return date.toISOString().slice(0, 10);
}

export default function Page({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Suspense
          fallback={
            <div className="rounded-xl border bg-white p-6 text-slate-500">
              Memuat formulir peminjaman...
            </div>
          }
        >
          <KontenAjukan searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function KontenAjukan({ searchParams }: Props) {
  const params = await searchParams;
  const idDariUrl = params.alat_id;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("alat")
    .select("id, nama, stok")
    .eq("aktif", true)
    .order("nama");

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-red-600">
          Gagal mengambil daftar alat: {error.message}
        </p>
      </div>
    );
  }

  const alat: AlatOption[] = (data ?? []).map((item) => ({
    id: String(item.id),
    nama: item.nama,
    stok: Number(item.stok),
  }));

  if (alat.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h1 className="font-bold text-slate-800">
          Belum Ada Alat Aktif
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Belum ada alat yang bisa diajukan untuk peminjaman.
        </p>
      </div>
    );
  }

  const idPilihan =
    typeof idDariUrl === "string" &&
    alat.some((item) => item.id === idDariUrl)
      ? idDariUrl
      : alat[0].id;

  const today = tanggalJakarta();

  return (
    <FormAjukan
      alat={alat}
      initialAlatId={idPilihan}
      today={today}
      maxDate={tambahHari(today, 14)}
    />
  );
}
