
"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  deleteAdminSession,
} from "../../lib/supabase/auth/admin";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return {
      status: "error",
      message: "Kata sandi harus diisi.",
    };
  }

  const passwordBenar = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!passwordBenar) {
    return {
      status: "error",
      message: "ADMIN_PASSWORD belum diatur di .env.local.",
    };
  }

  if (!sessionSecret || sessionSecret.length < 32) {
    return {
      status: "error",
      message: "SESSION_SECRET belum diatur dengan benar.",
    };
  }

  const inputHash = createHash("sha256")
    .update(password)
    .digest();

  const benarHash = createHash("sha256")
    .update(passwordBenar)
    .digest();

  if (!timingSafeEqual(inputHash, benarHash)) {
    return {
      status: "error",
      message: "Kata sandi yang kamu masukkan salah.",
    };
  }

  await createAdminSession();

  redirect("/admin");
}

export async function logoutAdmin() {
  await deleteAdminSession();

  redirect("/login");
}
