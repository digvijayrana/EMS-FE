"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, LoaderCircle, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getProfile, updateProfile } from "@/services/auth.service";
import { ErrorState, PageLoader } from "@/components/shared/page-state";
import { getApiErrorMessage } from "@/lib/api-error";
import type { UserProfile } from "@/types/auth";

export default function ProfilePage() {
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const profile: UserProfile | undefined = profileQuery.data?.data;
  if (profileQuery.isLoading) return <PageLoader label="Loading your profile..." />;
  if (profileQuery.isError || !profile) return <ErrorState message="Unable to load your profile." />;
  return <ProfileContent profile={profile} />;
}

function ProfileContent({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: profile.firstName || "", lastName: profile.lastName || "" });
  const save = useMutation({
    mutationFn: () => updateProfile(form),
    onSuccess: (response) => {
      const updated = response.data as UserProfile;
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
      window.dispatchEvent(new Event("user-updated"));
      queryClient.setQueryData(["profile"], response);
      toast.success("Profile updated successfully");
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "We could not update your profile.")),
  });

  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="mb-2 text-sm font-semibold text-primary">Your account</p><h1 className="page-title">User profile</h1><p className="mt-2 text-sm text-muted-foreground">Review your account information and update your display name.</p></div>
    <section className="overflow-hidden rounded-3xl border bg-card/90 shadow-xl shadow-slate-900/5">
      <div className="h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="px-6 pb-7 sm:px-8"><div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end"><span className="grid size-24 place-items-center rounded-3xl border-4 border-card bg-[#171a32] text-3xl font-bold text-white shadow-lg">{initials}</span><div className="pb-1"><div className="flex items-center gap-2"><h2 className="text-2xl font-bold">{name}</h2><BadgeCheck className="size-5 text-primary" /></div><p className="mt-1 text-sm capitalize text-muted-foreground">{profile.role.toLowerCase().replace("_", " ")}</p></div></div></div>
    </section>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="glass-card p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-5" /></span><div><h2 className="font-bold">Personal details</h2><p className="text-sm text-muted-foreground">This name appears in the application.</p></div></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2"><div><label className="label">First name</label><input required minLength={2} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="field" /></div><div><label className="label">Last name</label><input required minLength={2} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="field" /></div></div>
        <div className="mt-5"><label className="label">Email address</label><input value={profile.email} disabled className="field opacity-70" /><p className="mt-1.5 text-xs text-muted-foreground">Contact an administrator to change your sign-in email.</p></div>
        <button disabled={save.isPending} className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{save.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{save.isPending ? "Saving..." : "Save profile"}</button>
      </form>
      <div className="space-y-5">
        <section className="glass-card p-5"><div className="flex items-center gap-3"><Mail className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Email address</p><p className="font-semibold">{profile.email}</p></div></div></section>
        <section className="glass-card p-5"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-emerald-600" /><div><p className="text-xs text-muted-foreground">Account status</p><p className="font-semibold">{profile.isActive ? "Active and secure" : "Inactive"}</p></div></div></section>
        <section className="glass-card p-5"><div className="flex items-center gap-3"><CalendarDays className="size-5 text-violet-600" /><div><p className="text-xs text-muted-foreground">Member since</p><p className="font-semibold">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Organization member"}</p></div></div></section>
      </div>
    </div>
  </div>;
}
