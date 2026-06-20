"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react";
import { forgotPassword } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (reason) {
      setError(getApiErrorMessage(reason, "We could not process the request."));
    } finally { setLoading(false); }
  };
  return <main className="grid min-h-screen place-items-center p-5"><form onSubmit={submit} className="glass-card w-full max-w-md p-6 sm:p-8"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Mail /></span><h1 className="mt-5 text-2xl font-bold">Forgot your password?</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your work email and we&apos;ll send a secure, time-limited reset link.</p>{message && <div className="mt-5 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div>}{error && <div className="mt-5 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">{error}</div>}<div className="mt-6"><label className="label">Email address</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" /></div><button disabled={loading} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground">{loading && <LoaderCircle className="size-4 animate-spin" />}{loading ? "Sending..." : "Send reset link"}</button><Link href="/login" className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to sign in</Link></form></main>;
}
