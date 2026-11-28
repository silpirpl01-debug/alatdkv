
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "../../lib/supabase/admin";
import { getAdminSession } from "../../lib/supabase/auth/admin";

async function pastikanAdmin() {
  const session = await getAdminSession({ waitForRequest: false });

  if (!session) {
    redirect("/login");
  }
}

function ambilId(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!Number.isSafeInteger(id) || id < 1) {
    return null;
  }

  return id;
}

function perbaruiHalamanAdmin() {
  revalidatePath("/admin");
  revalidatePath("/alat");
  revalidatePath("/");
  revalidatePath("/cek");
}

function tampilkanError(pesan: string): never {
  redirect(`/admin?error=${encodeURIComponent(pesan)}`);
}

export async function serahkanPeminjaman(formData: FormData) {
  await pastikanAdmin();

  const id = ambilId(formData);

  if (!id) {
    tampilkanError("Nomor pengajuan tidak valid.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc(
    "alatdkv_serahkan_peminjaman",
    { p_id: id }
  );

  if (error) {
    tampilkanError(error.message);
  }

  perbaruiHalamanAdmin();

  redirect(`/admin?pesan=${encodeURIComponent("Alat berhasil diserahkan.")}`);
}

export async function tolakPeminjaman(formData: FormData) {
  await pastikanAdmin();

  const id = ambilId(formData);
  const alasan = String(formData.get("alasan") ?? "").trim();

  if (!id) {
    tampilkanError("Nomor pengajuan tidak valid.");
  }

  if (alasan.length < 5) {
    tampilkanError("Alasan penolakan minimal 5 karakter.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc(
    "alatdkv_tolak_peminjaman",
    {
      p_id: id,
      p_alasan: alasan,
    }
  );

  if (error) {
    tampilkanError(error.message);
  }

  perbaruiHalamanAdmin();

  redirect(`/admin?pesan=${encodeURIComponent("Pengajuan berhasil ditolak.")}`);
}

export async function kembalikanPeminjaman(formData: FormData) {
  await pastikanAdmin();

  const id = ambilId(formData);
  const kondisi = String(formData.get("kondisi") ?? "");

  if (!id) {
    tampilkanError("Nomor pengajuan tidak valid.");
  }

  if (!["baik", "rusak ringan", "rusak berat"].includes(kondisi)) {
    tampilkanError("Pilih kondisi pengembalian yang valid.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase.rpc(
    "alatdkv_kembalikan_peminjaman",
    {
      p_id: id,
      p_kondisi: kondisi,
    }
  );

  if (error) {
    tampilkanError(error.message);
  }

  perbaruiHalamanAdmin();

  redirect(`/admin?pesan=${encodeURIComponent("Pengembalian alat berhasil dicatat.")}`);
}
