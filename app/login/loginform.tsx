
"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "./actions";

const initialState: LoginState = {
  status: "idle",
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAdmin,
    initialState
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Login Admin
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Masukkan kata sandi untuk masuk ke halaman admin AlatDKV.
        </p>
      </div>

      {state.status === "error" && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {state.message}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Kata Sandi Admin
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Masukkan kata sandi"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
