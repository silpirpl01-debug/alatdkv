
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "./loginform";
import { getAdminSession } from "../../lib/supabase/auth/admin";

export default function LoginPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-blue-700">
            AlatDKV
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Panel Pengelolaan Laboratorium DKV
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-xl border bg-white p-6 text-center text-slate-500">
              Memeriksa sesi login...
            </div>
          }
        >
          <CekSesiLogin />
        </Suspense>
      </div>
    </main>
  );
}

async function CekSesiLogin() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return <LoginForm />;
}
