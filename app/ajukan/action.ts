
"use server";

import { createAdminClient } from "../../lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type FieldName =
  | "alat_id"
  | "tgl_pinjam"
  | "tgl_kembali"
  | "jumlah"
  | "peminjam"
  | "kelas"
  | "keperluan";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<FieldName, string>>;
  requestId?: string;
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

function tanggalValid(tanggal: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return false;
  }

  const date = new Date(`${tanggal}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === tanggal
  );
}

function akhirPekan(tanggal: string) {
  const hari = new Date(
    `${tanggal}T00:00:00.000Z`
  ).getUTCDay();

  return hari === 0 || hari === 6;
}

export async function submitPeminjaman(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const alatId = String(formData.get("alat_id") ?? "").trim();
  const tglPinjam = String(formData.get("tgl_pinjam") ?? "");
  const tglKembali = String(formData.get("tgl_kembali") ?? "");
  const peminjam = String(formData.get("peminjam") ?? "").trim();
  const kelas = String(formData.get("kelas") ?? "").trim();
  const keperluan = String(formData.get("keperluan") ?? "").trim();
  const jumlah = Number(formData.get("jumlah"));

  const errors: Partial<Record<FieldName, string>> = {};

  if (!/^\d+$/.test(alatId)) {
    errors.alat_id = "Pilih alat yang ingin dipinjam.";
  }

  if (peminjam.length < 3 || peminjam.length > 40) {
    errors.peminjam = "Nama harus terdiri dari 3–40 karakter.";
  }

  if (kelas.length < 3 || kelas.length > 20) {
    errors.kelas = "Kelas harus terdiri dari 3–20 karakter.";
  }

  if (keperluan.length < 5 || keperluan.length > 120) {
    errors.keperluan = "Keperluan harus terdiri dari 5–120 karakter.";
  }

  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 5) {
    errors.jumlah = "Jumlah peminjaman harus 1–5 unit.";
  }

  const hariIni = tanggalJakarta();
  const batasTanggal = tambahHari(hariIni, 14);

  if (!tanggalValid(tglPinjam)) {
    errors.tgl_pinjam = "Tanggal pinjam tidak valid.";
  } else if (tglPinjam < hariIni) {
    errors.tgl_pinjam = "Tanggal pinjam tidak boleh di masa lalu.";
  } else if (tglPinjam > batasTanggal) {
    errors.tgl_pinjam = "Tanggal pinjam maksimal 14 hari ke depan.";
  } else if (akhirPekan(tglPinjam)) {
    errors.tgl_pinjam = "Tanggal pinjam tidak boleh Sabtu atau Minggu.";
  }

  if (!tanggalValid(tglKembali)) {
    errors.tgl_kembali = "Tanggal kembali tidak valid.";
  } else if (akhirPekan(tglKembali)) {
    errors.tgl_kembali = "Tanggal kembali tidak boleh Sabtu atau Minggu.";
  }

  if (tanggalValid(tglPinjam) && tanggalValid(tglKembali)) {
    if (tglKembali < tglPinjam) {
      errors.tgl_kembali =
        "Tanggal kembali tidak boleh sebelum tanggal pinjam.";
    } else {
      const selisih =
        (new Date(`${tglKembali}T00:00:00Z`).getTime() -
          new Date(`${tglPinjam}T00:00:00Z`).getTime()) /
        86400000;

      if (selisih > 3) {
        errors.tgl_kembali = "Lama peminjaman maksimal 3 hari.";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali data yang kamu isi.",
      fieldErrors: errors,
    };
  }

  try {
    const supabase = createAdminClient();

    // Memastikan alat masih aktif.
    const { data: alat, error: errorAlat } = await supabase
      .from("alat")
      .select("id, stok, aktif")
      .eq("id", Number(alatId))
      .maybeSingle();

    if (errorAlat || !alat) {
      return {
        status: "error",
        message: "Alat tidak ditemukan.",
        fieldErrors: {
          alat_id: "Pilih alat yang masih tersedia.",
        },
      };
    }

    if (!alat.aktif) {
      return {
        status: "error",
        message: "Alat sudah tidak aktif.",
        fieldErrors: {
          alat_id: "Pilih alat yang masih aktif.",
        },
      };
    }

    if (jumlah > Number(alat.stok)) {
      return {
        status: "error",
        message: "Jumlah peminjaman melebihi stok alat.",
        fieldErrors: {
          jumlah: `Stok keseluruhan alat hanya ${alat.stok} unit.`,
        },
      };
    }

    // Memeriksa maksimal dua permohonan aktif per nama.
    const { data: permohonanAktif, error: errorAktif } =
      await supabase
        .from("peminjaman_alat")
        .select("peminjam")
        .in("status", ["menunggu", "dipinjam"]);

    if (errorAktif) {
      throw errorAktif;
    }

    const namaDicari = peminjam.toLocaleLowerCase("id-ID");

    const totalAktif = (permohonanAktif ?? []).filter(
      (item) =>
        item.peminjam.trim().toLocaleLowerCase("id-ID") === namaDicari
    ).length;

    if (totalAktif >= 2) {
      return {
        status: "error",
        message: "Batas pengajuan sudah tercapai.",
        fieldErrors: {
          peminjam: "Satu peminjam maksimal memiliki 2 permohonan aktif.",
        },
      };
    }

    // Menyimpan pengajuan dengan status menunggu.
    const { data: pengajuan, error: errorSimpan } = await supabase
      .from("peminjaman_alat")
      .insert({
        alat_id: Number(alatId),
        peminjam,
        kelas,
        keperluan,
        jumlah,
        tgl_pinjam: tglPinjam,
        tgl_kembali: tglKembali,
        status: "menunggu",
      })
      .select("id")
      .single();

    if (errorSimpan) {
      throw errorSimpan;
    }

    revalidatePath("/");
    revalidatePath("/alat");
    revalidatePath(`/alat/${alatId}`);

    return {
      status: "success",
      message: "Pengajuan peminjaman berhasil disimpan.",
      requestId: String(pengajuan.id),
    };
  } catch (error) {
    console.error("Gagal menyimpan peminjaman:", error);

    return {
      status: "error",
      message: "Pengajuan belum berhasil disimpan. Silakan coba lagi.",
    };
  }
}
