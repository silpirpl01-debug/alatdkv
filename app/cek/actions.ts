
"use server";

import { createAdminClient } from "../../lib/supabase/admin";

export type HasilCek = {
  nomor: string;
  nama: string;
  namaAlat: string;
  jumlah: number;
  tglPinjam: string;
  tglKembali: string;
  tglDikembalikan: string | null;
  status: string;
  terlambat: boolean;
  alasanTolak: string | null;
  kondisiKembali: string | null;
};

export type CekState = {
  status: "idle" | "error" | "success";
  message?: string;
  hasil?: HasilCek;
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

export async function cekStatusPeminjaman(
  _prevState: CekState,
  formData: FormData
): Promise<CekState> {
  const nomor = String(formData.get("nomor") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();

  if (!/^\d+$/.test(nomor)) {
    return {
      status: "error",
      message: "Nomor pengajuan harus berupa angka.",
    };
  }

  if (nama.length < 3 || nama.length > 40) {
    return {
      status: "error",
      message: "Nama harus terdiri dari 3–40 karakter.",
    };
  }

  try {
    const supabase = createAdminClient();

    // Mencari pengajuan berdasarkan nomor.
    const { data: pinjaman, error } = await supabase
      .from("peminjaman_alat")
      .select(
        "id, alat_id, peminjam, jumlah, tgl_pinjam, tgl_kembali, tgl_dikembalikan, status, alasan_tolak, kondisi_kembali"
      )
      .eq("id", nomor)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Memastikan nomor dan nama peminjam cocok.
    const namaCocok =
      pinjaman &&
      pinjaman.peminjam.trim().toLocaleLowerCase("id-ID") ===
        nama.toLocaleLowerCase("id-ID");

    if (!pinjaman || !namaCocok) {
      return {
        status: "error",
        message: "Nomor pengajuan atau nama peminjam tidak cocok.",
      };
    }

    // Mengambil nama alat yang dipinjam.
    const { data: alat, error: errorAlat } = await supabase
      .from("alat")
      .select("nama")
      .eq("id", pinjaman.alat_id)
      .maybeSingle();

    if (errorAlat) {
      throw errorAlat;
    }

    // Status terlambat jika masih dipinjam dan tanggal kembali lewat.
    const terlambat =
      pinjaman.status === "dipinjam" &&
      tanggalJakarta() > pinjaman.tgl_kembali;

    return {
      status: "success",
      message: "Data pengajuan ditemukan.",
      hasil: {
        nomor: String(pinjaman.id),
        nama: pinjaman.peminjam,
        namaAlat: alat?.nama ?? "Alat tidak ditemukan",
        jumlah: Number(pinjaman.jumlah),
        tglPinjam: pinjaman.tgl_pinjam,
        tglKembali: pinjaman.tgl_kembali,
        tglDikembalikan: pinjaman.tgl_dikembalikan,
        status: pinjaman.status,
        terlambat,
        alasanTolak: pinjaman.alasan_tolak,
        kondisiKembali: pinjaman.kondisi_kembali,
      },
    };
  } catch (error) {
    console.error("Gagal mengecek status peminjaman:", error);

    return {
      status: "error",
      message: "Terjadi kesalahan saat memeriksa pengajuan.",
    };
  }
}
