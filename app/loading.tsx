
export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl animate-pulse">
        {/* Siluet judul */}
        <div className="mb-4 h-8 w-64 rounded-lg bg-slate-200" />
        <div className="mb-10 h-4 w-80 max-w-full rounded bg-slate-200" />

        {/* Siluet konten */}
        <div className="space-y-5">
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
