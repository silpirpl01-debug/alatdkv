
export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 animate-pulse">
          <div className="mb-3 h-8 w-56 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-5 h-44 rounded-xl bg-slate-200" />
              <div className="mb-3 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mb-5 h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
