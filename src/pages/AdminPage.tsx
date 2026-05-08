import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppShell } from "../components/AppShell";
import { TopBar } from "../components/TopBar";
import { db } from "../services/db";
import { getRecentAppErrors } from "../services/errorLogService";
import { getRecentAdminAuditLogs } from "../services/adminAuditService";
import type { AdminAuditLog, AppErrorLog } from "../types";
import { useAuth } from "../context/AuthProvider";

interface AdminMetrics {
  totalUsersLabel: string;
  newUsersTodayLabel: string;
  newUsersWeekLabel: string;
  totalVentures: number;
  totalCustomers: number;
  totalLedgerRecords: number;
  activeUsersLabel: string;
}

export function AdminPage() {
  const { user, profile, isConfigured } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [errors, setErrors] = useState<AppErrorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      const [businesses, customers, ledgerEntries, errorLogs, audits] = await Promise.all([
        db.businesses.toArray(),
        db.customers.toArray(),
        db.ledgerEntries.toArray(),
        getRecentAppErrors(8),
        getRecentAdminAuditLogs(12),
      ]);

      setMetrics({
        totalUsersLabel: isConfigured ? "Supabase dashboard / profiles" : "Needs Supabase setup",
        newUsersTodayLabel: isConfigured ? "Check Supabase dashboard" : "Not available locally",
        newUsersWeekLabel: isConfigured ? "Check Supabase dashboard" : "Not available locally",
        totalVentures: businesses.length,
        totalCustomers: customers.length,
        totalLedgerRecords: ledgerEntries.length,
        activeUsersLabel: "Approximate from analytics/manual review",
      });
      setErrors(errorLogs);
      setAuditLogs(audits);
    }

    void loadAdminData();
  }, [isConfigured]);

  const bundleMeta = useMemo(
    () => ({
      version: __APP_VERSION__,
      buildTime: __BUILD_TIME__,
    }),
    []
  );

  return (
    <AppShell>
      <TopBar title="Admin" />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-600">
            Superadmin status
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Signed in as {profile?.email ?? user?.email}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This admin area is frontend-safe by default. Local operational totals are shown here,
            while exact platform-wide usage should still be checked in Supabase and Netlify.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Total users" value={metrics?.totalUsersLabel ?? "Loading..."} />
          <MetricTile label="New users today" value={metrics?.newUsersTodayLabel ?? "Loading..."} />
          <MetricTile label="New users this week" value={metrics?.newUsersWeekLabel ?? "Loading..."} />
          <MetricTile label="Active users" value={metrics?.activeUsersLabel ?? "Loading..."} />
          <MetricTile label="Total ventures" value={String(metrics?.totalVentures ?? 0)} />
          <MetricTile label="Total customers" value={String(metrics?.totalCustomers ?? 0)} />
          <MetricTile label="Ledger records" value={String(metrics?.totalLedgerRecords ?? 0)} />
          <MetricTile label="Bundle / build" value={`v${bundleMeta.version}`} detail={bundleMeta.buildTime} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel
            title="System health"
            body={
              <div className="space-y-3 text-sm text-slate-700">
                <p>Recent errors are logged locally so runtime failures do not disappear silently.</p>
                <p>Sync failures remain approximate until server-side sync is fully implemented.</p>
                <p>Check Supabase Auth logs and Netlify deploy logs for platform-level failures.</p>
              </div>
            }
          />
          <Panel
            title="Free-plan guardrails"
            body={
              <div className="space-y-3 text-sm text-slate-700">
                <p>Largest users by record count still need a secure server report or SQL view.</p>
                <p>Storage usage, auth bursts, and database egress should be monitored in platform dashboards.</p>
                <p>Bundle size warning is manual for now; review Netlify deploy output before launch.</p>
              </div>
            }
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel
            title="Recent app errors"
            body={
              errors.length ? (
                <ul className="space-y-3 text-sm text-slate-700">
                  {errors.map((entry) => (
                    <li key={entry.id} className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">
                        [{entry.severity}] {entry.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{entry.createdAt}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">No recent local app errors recorded.</p>
              )
            }
          />
          <Panel
            title="Audit logs"
            body={
              auditLogs.length ? (
                <ul className="space-y-3 text-sm text-slate-700">
                  {auditLogs.map((entry) => (
                    <li key={entry.id} className="rounded-2xl bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">{entry.action}</p>
                      <p className="mt-1 text-xs text-slate-500">{entry.createdAt}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">Audit logging will appear here once admin activity occurs.</p>
              )
            }
          />
        </section>
      </div>
    </AppShell>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black tracking-tight text-slate-950">{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

function Panel({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
      <div className="mt-4">{body}</div>
    </div>
  );
}
