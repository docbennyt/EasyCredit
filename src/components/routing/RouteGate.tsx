import type { ReactNode } from "react";

export function RouteGate({
  title,
  message,
}: {
  title: string;
  message: string;
}): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">
          EasyCredit
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </div>
  );
}
