"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { loginUser } from "@/services/auth.service";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const { data } = await loginUser({ email, password });
      Cookies.set("accessToken", data.accessToken, { expires: 1, sameSite: "lax" });
      Cookies.set("refreshToken", data.refreshToken, { expires: 30, sameSite: "lax" });
      localStorage.setItem("user", JSON.stringify(data.user));
      router.replace(data.user.role === "EMPLOYEE" ? "/profile" : "/dashboard");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "We could not sign you in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#11152a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/4 size-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Sparkles /></span>
          <div><p className="font-bold">PeopleCore</p><p className="text-xs text-indigo-200">Employee Management</p></div>
        </div>
        <div className="relative max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/15">
            <ShieldCheck className="size-4 text-emerald-300" /> Secure people operations
          </span>
          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">Your team deserves a calmer way to work.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-indigo-100/80">
            Employees, attendance, leave and payroll—organized in one focused, beautiful workspace.
          </p>
          <div className="mt-10 flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <span className="grid size-12 place-items-center rounded-xl bg-indigo-500/25"><UsersRound /></span>
            <div><p className="font-semibold">Built for growing teams</p><p className="mt-1 text-sm text-indigo-100/65">Less admin, clearer decisions, happier people.</p></div>
          </div>
        </div>
        <p className="relative text-xs text-indigo-200/55">PeopleCore EMS · Human operations, thoughtfully designed.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"><Sparkles /></span>
            <p className="text-lg font-bold">PeopleCore EMS</p>
          </div>
          <p className="text-sm font-semibold text-primary">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Sign in to your workspace</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Use your organization account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@company.com" required />
            </div>
            <div>
              <div className="flex items-center justify-between"><label className="label" htmlFor="password">Password</label><Link href="/forgot-password" className="mb-1.5 text-xs font-semibold text-primary hover:underline">Forgot password?</Link></div>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field pr-11" placeholder="Enter your password" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:translate-y-0 disabled:opacity-60">
              {loading ? <><LoaderCircle className="size-4 animate-spin" /> Signing in...</> : <>Sign in <ArrowRight className="size-4" /></>}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-muted-foreground">Protected by role-based access and secure token authentication.</p>
        </div>
      </section>
    </main>
  );
}
