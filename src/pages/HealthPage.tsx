export function HealthPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-200">
          EasyCredit health
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">App shell is responding.</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <HealthCard label="Status" value="ok" />
          <HealthCard label="Version" value={__APP_VERSION__} />
          <HealthCard label="Build time" value={__BUILD_TIME__} />
          <HealthCard label="Mode" value={import.meta.env.MODE} />
        </div>
      </div>
    </div>
  );
}

function HealthCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
