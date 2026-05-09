import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

type AuthMode = "login" | "signup";

export function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, session, profile, isConfigured, loading, authError, needsOnlineLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const from = location.state as { from?: string } | null;
    return from?.from ?? "/open";
  }, [location.state]);

  useEffect(() => {
    if (!loading && session) {
      navigate(profile?.onboardingCompleted ? "/dashboard" : "/onboarding", {
        replace: true,
      });
    }
  }, [loading, navigate, profile?.onboardingCompleted, session]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate(nextPath, { replace: true });
      }
    } else {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else if (result.requiresEmailConfirmation) {
        setMessage(
          "Account created. Check your email to confirm the account, then come back and sign in."
        );
        setMode("login");
      } else {
        navigate("/onboarding", { replace: true });
      }
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(109,44,255,0.14),_transparent_28rem),linear-gradient(180deg,_#ffffff_0%,_#f8f9fc_52%,_#ffffff_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-[2rem] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-2xl lg:block">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-purple-200">
            EasyCredit access
          </p>
          <h1 className="mt-6 max-w-xl text-5xl font-black tracking-tight">
            Land first. Sign in safely. Reach the right workspace next.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
            Public visitors start on the landing page, existing users go back to their dashboard,
            and new users continue through onboarding before any business data opens.
          </p>
          <div className="mt-10 grid gap-4 text-sm text-slate-200">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              Login returns authenticated users to the dashboard if onboarding is complete.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              Sign up creates a Supabase-authenticated account and starts onboarding at the right
              place.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              Superadmin access is unlocked only for the allowlisted email after Supabase login.
            </div>
          </div>
        </section>

        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-600">
                EasyCredit
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {mode === "login" ? "Login to EasyCredit" : "Create your account"}
              </h2>
            </div>
            <Link className="text-sm font-semibold text-slate-600" to="/">
              Back to landing
            </Link>
          </div>

          {!isConfigured ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Supabase is not configured yet. Add `VITE_SUPABASE_URL` and
              `VITE_SUPABASE_ANON_KEY` in your Netlify and local environment before launch.
            </div>
          ) : null}

          {authError ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {authError}
            </div>
          ) : null}

          {needsOnlineLogin ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              You need to sign in once while online before offline access can work on this device.
            </div>
          ) : null}

          {message ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                  placeholder="Benedictus T Makuyana"
                  type="text"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                placeholder="dr.bennyt.09@gmail.com"
                type="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                placeholder="Use your Supabase Auth password"
                type="password"
                required
                minLength={8}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || !isConfigured || !window.navigator.onLine}
              className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "Working..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            After login, EasyCredit sends new accounts to onboarding and returning users with a
            completed profile to `/dashboard`.
          </div>

          
        </section>
      </div>
    </div>
  );
}
