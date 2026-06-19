"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Pencil, Plus, Search, Trash2, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveSalaryAdvance, createSalaryAdvance, deleteSalaryAdvance, getSalaryAdvances, updateSalaryAdvance } from "@/services/salary-advance.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import { getApiErrorMessage } from "@/lib/api-error";
import type { SalaryAdvance } from "@/types/api";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
type AdvanceForm = { employeeId: string; amount: string; reason: string; repaymentMonth: number; repaymentYear: number };
const emptyForm = (): AdvanceForm => { const now = new Date(); return { employeeId: "", amount: "", reason: "", repaymentMonth: now.getMonth() + 1, repaymentYear: now.getFullYear() }; };

export default function SalaryAdvancePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<AdvanceForm>(emptyForm);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const advancesQuery = useQuery({ queryKey: ["salary-advances", filters.status], queryFn: () => getSalaryAdvances({ limit: 500, ...(filters.status && { status: filters.status }) }) });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 500 }) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["salary-advances"] });
    queryClient.invalidateQueries({ queryKey: ["navbar", "pending-advances"] });
  };
  const save = useMutation({
    mutationFn: () => {
      const payload = { amount: Number(form.amount), reason: form.reason, repaymentMonth: form.repaymentMonth, repaymentYear: form.repaymentYear };
      return editingId ? updateSalaryAdvance(editingId, payload) : createSalaryAdvance({ employeeId: form.employeeId, ...payload });
    },
    onSuccess: () => { toast.success(editingId ? "Salary advance updated" : "Salary advance requested"); setOpen(false); setEditingId(undefined); setForm(emptyForm()); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save the salary advance.")),
  });
  const review = useMutation({ mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => approveSalaryAdvance(id, status), onSuccess: (_, value) => { toast.success(`Request ${value.status.toLowerCase()}`); refresh(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Unable to review request.")) });
  const remove = useMutation({ mutationFn: deleteSalaryAdvance, onSuccess: () => { toast.success("Salary advance deleted"); refresh(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete request.")) });
  if (advancesQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading salary advances..." />;
  if (advancesQuery.isError || employeesQuery.isError) return <ErrorState />;

  const allAdvances: SalaryAdvance[] = advancesQuery.data?.data?.data || [];
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const map = new Map(employees.map((e) => [e._id, e]));
  const advances = allAdvances.filter((advance) => { const employee = map.get(advance.employeeId); return `${employee?.firstName || ""} ${employee?.lastName || ""}`.toLowerCase().includes(filters.search.toLowerCase()); });
  const pending = allAdvances.filter((i) => i.status === "PENDING");
  const stats = [
    { label: "Total requested", value: money(allAdvances.reduce((sum, item) => sum + item.amount, 0)), icon: Wallet, tone: "bg-indigo-500/10 text-indigo-600" },
    { label: "Pending amount", value: money(pending.reduce((sum, item) => sum + item.amount, 0)), icon: Clock3, tone: "bg-amber-500/10 text-amber-600" },
    { label: "Approved requests", value: allAdvances.filter((item) => item.status === "APPROVED").length, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-600" },
  ];
  const openCreate = () => { setEditingId(undefined); setForm(emptyForm()); setOpen(true); };
  const openEdit = (advance: SalaryAdvance) => { setEditingId(advance._id); setForm({ employeeId: advance.employeeId, amount: String(advance.amount), reason: advance.reason, repaymentMonth: advance.repaymentMonth, repaymentYear: advance.repaymentYear }); setOpen(true); };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-primary">Financial support</p><h1 className="page-title">Salary advances</h1><p className="mt-2 text-sm text-muted-foreground">Create, edit, approve, reject and remove employee advance requests.</p></div><button onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> New advance</button></div>
    <div className="grid gap-4 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>
    <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_200px]"><div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="field pl-10" placeholder="Search employee..." /></div><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="field"><option value="">All statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></div>
    <div className="table-shell"><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Reason</th><th className="px-5 py-4">Repayment</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{advances.map((advance) => { const employee = map.get(advance.employeeId); return <tr key={advance._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}<p className="mt-0.5 text-xs font-normal text-muted-foreground">{employee?.employeeCode}</p></td><td className="px-5 py-4 font-bold">{money(advance.amount)}</td><td className="max-w-64 truncate px-5 py-4 text-muted-foreground">{advance.reason}</td><td className="px-5 py-4">{new Date(advance.repaymentYear, advance.repaymentMonth - 1).toLocaleString("en", { month: "short", year: "numeric" })}</td><td className="px-5 py-4"><StatusPill status={advance.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1">{advance.status === "PENDING" && <><button onClick={() => openEdit(advance)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button><button onClick={() => review.mutate({ id: advance._id, status: "APPROVED" })} className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"><CheckCircle2 className="size-4" /></button><button onClick={() => review.mutate({ id: advance._id, status: "REJECTED" })} className="rounded-lg bg-rose-500/10 p-2 text-rose-600"><XCircle className="size-4" /></button></>}<button onClick={() => confirm("Delete this salary advance request?") && remove.mutate(advance._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"><Trash2 className="size-4" /></button></div></td></tr>; })}</tbody></table></div>{!advances.length && <EmptyState title="No salary advances" description="Change the filters or create a new request." />}</div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editingId ? "Edit salary advance" : "Request salary advance"}</DialogTitle><DialogDescription>{editingId ? "Pending requests can be changed before approval." : "Create an advance request for an active employee."}</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4"><div><label className="label">Employee</label><select required disabled={Boolean(editingId)} className="field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select employee</option>{employees.filter((e) => e.status === "ACTIVE" || e._id === form.employeeId).map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div><div><label className="label">Advance amount</label><input required min="1" type="number" className="field" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div><div><label className="label">Reason</label><textarea required minLength={5} className="field min-h-24 py-3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div><label className="label">Repayment month</label><select className="field" value={form.repaymentMonth} onChange={(e) => setForm({ ...form, repaymentMonth: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "long" })}</option>)}</select></div><div><label className="label">Year</label><input type="number" min={2025} className="field" value={form.repaymentYear} onChange={(e) => setForm({ ...form, repaymentYear: Number(e.target.value) })} /></div></div><button disabled={save.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{save.isPending ? "Saving..." : editingId ? "Update request" : "Submit request"}</button></form></DialogContent></Dialog>
  </div>;
}
