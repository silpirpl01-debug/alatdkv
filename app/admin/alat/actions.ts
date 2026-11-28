
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getAdminSession } from "../../../lib/supabase/auth/admin";

const kategoriValid = [
  "kamera",
  "pencahayaan",
  "audio",
  "tablet",
  "aksesori",
];

async function pastikanAdmin() {
  const session = await getAdminSession({
    waitForRequest: false,
  });

  if (!session) {
    redirect("/login");
  }
}

function ambilId(formData: FormData) {
  const id = Number(formData.get("id"));

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function perbaruiHalaman() {
  revalidatePath("/admin/alat");
  revalidatePath("/admin");
  revalidatePath("/alat");
  revalidatePath("/");
}

function errorHalaman(pesan: string): never {
  redirect(`/admin/alat?error=${encodeURIComponent(pesan)}`);
}

function suksesHalaman(pesan: string): never {
  perbaruiHalaman();

  redirect(`/admin/alat?pesan=${encodeURIComponent(pesan)}`);
}

function ambilDataAlat(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "");
  const stok = Number(formData.get("stok"));
  const keterangan = String(formData.get("keterangan") ?? "").trim();

  if (nama.length < 3 || nama.length > 40) {
    errorHalaman("Nama alat harus terdiri dari 3–40 karakter.");
  }

  if (!kategoriValid.includes(kategori)) {
    errorHalaman("Pilih kategori alat yang valid.");
  }

  if (!Number.isInteger(stok) || stok < 0 || stok > 50) {
    errorHalaman("Stok alat harus 0–50 unit.");
  }

  return {
    nama,
    kategori,
    stok,
    keterangan,
  };
}

// Menambahkan alat baru.
export async function tambahAlat(formData: FormData) {
  await pastikanAdmin();

  const data = ambilDataAlat(formData);
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("alatdkv_tambah_alat", {
    p_nama: data.nama,
    p_kategori: data.kategori,
    p_stok: data.stok,
    p_keterangan: data.keterangan,
  });

  if (error) {
    errorHalaman(error.message);
  }

  suksesHalaman("Alat berhasil ditambahkan.");
}

// Mengubah informasi dan stok alat.
export async function ubahAlat(formData: FormData) {
  await pastikanAdmin();

  const id = ambilId(formData);

  if (!id) {
    errorHalaman("ID alat tidak valid.");
  }

  const data = ambilDataAlat(formData);
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("alatdkv_ubah_alat", {
    p_id: id,
    p_nama: data.nama,
    p_kategori: data.kategori,
    p_stok: data.stok,
    p_keterangan: data.keterangan,
  });

  if (error) {
    errorHalaman(error.message);
  }

  suksesHalaman("Data alat berhasil diperbarui.");
}

// Mengaktifkan atau menonaktifkan alat.
export async function ubahStatusAlat(formData: FormData) {
  await pastikanAdmin();

  const id = ambilId(formData);
  const aktif = String(formData.get("aktif"));

  if (!id || !["true", "false"].includes(aktif)) {
    errorHalaman("Data perubahan status tidak valid.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc("alatdkv_ubah_aktif_alat", {
    p_id: id,
    p_aktif: aktif === "true",
  });

  if (error) {
    errorHalaman(error.message);
  }

  suksesHalaman(
    aktif === "true"
      ? "Alat berhasil diaktifkan."
      : "Alat berhasil dinonaktifkan."
  );
}

// Menghapus alat yang belum memiliki riwayat peminjaman.
export async function hapusAlat(formData: FormData) {
  await pastikanAdmin();

  const id = ambilId(formData);

  if (!id) {
    errorHalaman("ID alat tidak valid.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc("alatdkv_hapus_alat", {
    p_id: id,
  });

  if (error) {
    errorHalaman(error.message);
  }

  suksesHalaman("Alat berhasil dihapus.");
}
