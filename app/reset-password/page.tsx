"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { resetPassword } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) { setError("Password and confirmation do not match."); return; }
    setLoading(true); setError("");
    try { await resetPassword(token, password); setSuccess(true); }
    catch (reason) { setError(getApiErrorMessage(reason, "We could not set your password.")); }
    finally { setLoading(false); }
  };
  if (success) return <div className="glass-card w-full max-w-md p-8 text-center"><CheckCircle2 className="mx-auto size-12 text-emerald-600" /><h1 className="mt-4 text-2xl font-bold">Password ready</h1><p className="mt-2 text-sm text-muted-foreground">Your password has been set. You can now sign in to your employee account.</p><Link href="/login" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Continue to sign in</Link></div>;
  return <form onSubmit={submit} className="glass-card w-full max-w-md p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole /></span><h1 className="mt-5 text-2xl font-bold">Set a new password</h1><p className="mt-2 text-sm text-muted-foreground">Choose at least 8 characters. Use a unique password you do not use elsewhere.</p>{!token && <div className="mt-5 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">This link does not contain a valid reset token.</div>}{error && <div className="mt-5 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">{error}</div>}<div className="mt-6 space-y-4"><div><label className="label">New password</label><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" /></div><div><label className="label">Confirm password</label><input required minLength={8} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field" /></div></div><button disabled={loading || !token} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-50">{loading && <LoaderCircle className="size-4 animate-spin" />}{loading ? "Saving..." : "Set password"}</button></form>;
}

export default function ResetPasswordPage() {
  return <main className="grid min-h-screen place-items-center p-5"><Suspense fallback={<LoaderCircle className="animate-spin" />}><ResetPasswordForm /></Suspense></main>;
}
