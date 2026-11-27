
import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

const COOKIE_NAME = "alatdkv_admin_session";
const DURASI_SESI = 8 * 60 * 60;

type AdminSession = {
  role: "admin";
  expiresAt: number;
};

export async function createAdminSession() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET belum diatur dengan benar.");
  }

  const expiresAt = Date.now() + DURASI_SESI * 1000;

  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      expiresAt,
    })
  ).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURASI_SESI,
    expires: new Date(expiresAt),
  });
}

export async function getAdminSession(
  options: { waitForRequest?: boolean } = {}
): Promise<AdminSession | null> {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    return null;
  }

  // Menunggu request sebelum membaca cookie dan waktu saat ini.
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const bagian = token.split(".");

  if (bagian.length !== 2) {
    return null;
  }

  const [payload, signature] = bagian;

  const signatureBenar = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const benarBuffer = Buffer.from(signatureBenar);

  if (
    signatureBuffer.length !== benarBuffer.length ||
    !timingSafeEqual(signatureBuffer, benarBuffer)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession;

    if (
      data.role !== "admin" ||
      typeof data.expiresAt !== "number" ||
      data.expiresAt <= Date.now()
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
