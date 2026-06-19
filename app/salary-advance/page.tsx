"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Plus, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveSalaryAdvance, createSalaryAdvance, getSalaryAdvances } from "@/services/salary-advance.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import type { SalaryAdvance } from "@/types/api";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function SalaryAdvancePage() {
  const now = new Date();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", amount: "", reason: "", repaymentMonth: now.getMonth() + 1, repaymentYear: now.getFullYear() });
  const advancesQuery = useQuery({ queryKey: ["salary-advances"], queryFn: () => getSalaryAdvances({ limit: 100 }) });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 100 }) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["salary-advances"] });
  const create = useMutation({ mutationFn: () => createSalaryAdvance({ ...form, amount: Number(form.amount) }), onSuccess: () => { toast.success("Salary advance requested"); setOpen(false); refresh(); }, onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to create request") });
  const review = useMutation({ mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => approveSalaryAdvance(id, status), onSuccess: (_, v) => { toast.success(`Request ${v.status.toLowerCase()}`); refresh(); }, onError: () => toast.error("Unable to update request") });
  if (advancesQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading salary advances..." />;
  if (advancesQuery.isError || employeesQuery.isError) return <ErrorState />;

  const advances: SalaryAdvance[] = advancesQuery.data?.data?.data || [];
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const map = new Map(employees.map((e) => [e._id, e]));
  const pending = advances.filter((i) => i.status === "PENDING");
  const stats = [
    { label: "Total requested", value: money(advances.reduce((s, i) => s + i.amount, 0)), icon: Wallet, tone: "bg-indigo-500/10 text-indigo-600" },
    { label: "Pending amount", value: money(pending.reduce((s, i) => s + i.amount, 0)), icon: Clock3, tone: "bg-amber-500/10 text-amber-600" },
    { label: "Approved requests", value: advances.filter((i) => i.status === "APPROVED").length, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-600" },
  ];
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-primary">Financial support</p><h1 className="page-title">Salary advances</h1><p className="mt-2 text-sm text-muted-foreground">Manage employee advance requests and repayment periods.</p></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> New advance</button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Request salary advance</DialogTitle><DialogDescription>Create an advance request for an active employee.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4"><div><label className="label">Employee</label><select required className="field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select employee</option>{employees.filter((e) => e.status === "ACTIVE").map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div><div><label className="label">Advance amount</label><input required min="1" type="number" className="field" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="₹ 0" /></div><div><label className="label">Reason</label><textarea required minLength={5} className="field min-h-24 py-3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div><label className="label">Repayment month</label><select className="field" value={form.repaymentMonth} onChange={(e) => setForm({ ...form, repaymentMonth: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "long" })}</option>)}</select></div><div><label className="label">Year</label><input type="number" min={2025} className="field" value={form.repaymentYear} onChange={(e) => setForm({ ...form, repaymentYear: Number(e.target.value) })} /></div></div><button disabled={create.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{create.isPending ? "Submitting..." : "Submit request"}</button></form></DialogContent></Dialog>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>
    <div className="table-shell"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Reason</th><th className="px-5 py-4">Repayment</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Review</th></tr></thead><tbody className="divide-y">{advances.map((advance) => { const employee = map.get(advance.employeeId); return <tr key={advance._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}</td><td className="px-5 py-4 font-bold">{money(advance.amount)}</td><td className="max-w-64 truncate px-5 py-4 text-muted-foreground">{advance.reason}</td><td className="px-5 py-4">{new Date(advance.repaymentYear, advance.repaymentMonth - 1).toLocaleString("en", { month: "short", year: "numeric" })}</td><td className="px-5 py-4"><StatusPill status={advance.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{advance.status === "PENDING" ? <><button onClick={() => review.mutate({ id: advance._id, status: "APPROVED" })} className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"><CheckCircle2 className="size-4" /></button><button onClick={() => review.mutate({ id: advance._id, status: "REJECTED" })} className="rounded-lg bg-rose-500/10 p-2 text-rose-600"><XCircle className="size-4" /></button></> : "—"}</div></td></tr>; })}</tbody></table></div>{!advances.length && <EmptyState title="No salary advances" description="Advance requests will appear here." />}</div>
  </div>;
}
