
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="text-xl font-bold text-blue-700">
        AlatDKV
      </h1>

      <div className="flex gap-5 text-sm">
        <Link href="/" className="hover:text-blue-600">
          Beranda
        </Link>

        <Link href="/alat" className="hover:text-blue-600">
          Daftar Alat
        </Link>

        <Link href="/cek" className="hover:text-blue-600">
          Cek Status
        </Link>

        <Link href="/login" className="hover:text-blue-600">
          Admin
        </Link>
      </div>
    </nav>
  );
}
