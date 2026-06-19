"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveLeave, createLeave, getLeaves } from "@/services/leave.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import type { LeaveRecord } from "@/types/api";
import type { Employee } from "@/types/employee";

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
  const leavesQuery = useQuery({ queryKey: ["leaves"], queryFn: () => getLeaves({ limit: 100 }) });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 100 }) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["leaves"] });
  const create = useMutation({ mutationFn: () => createLeave(form), onSuccess: () => { toast.success("Leave request created"); setOpen(false); refresh(); }, onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to create leave") });
  const review = useMutation({ mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => approveLeave(id, status), onSuccess: (_, variables) => { toast.success(`Leave ${variables.status.toLowerCase()}`); refresh(); }, onError: () => toast.error("Unable to update leave") });

  if (leavesQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading leave requests..." />;
  if (leavesQuery.isError || employeesQuery.isError) return <ErrorState />;
  const leaves: LeaveRecord[] = leavesQuery.data?.data?.data || [];
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const map = new Map(employees.map((e) => [e._id, e]));
  const stats = [{ label: "All requests", value: leaves.length, icon: CalendarDays, tone: "bg-indigo-500/10 text-indigo-600" }, { label: "Pending", value: leaves.filter((i) => i.status === "PENDING").length, icon: Clock3, tone: "bg-amber-500/10 text-amber-600" }, { label: "Approved", value: leaves.filter((i) => i.status === "APPROVED").length, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-600" }, { label: "Rejected", value: leaves.filter((i) => i.status === "REJECTED").length, icon: XCircle, tone: "bg-rose-500/10 text-rose-600" }];

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-primary">Time away</p><h1 className="page-title">Leave requests</h1><p className="mt-2 text-sm text-muted-foreground">Create, review and track employee time off.</p></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> New request</button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>New leave request</DialogTitle><DialogDescription>Submit time off on behalf of an employee.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Employee</label><select required className="field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select employee</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div>
        <div><label className="label">Leave type</label><select className="field" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>{["CASUAL", "SICK", "PAID", "UNPAID"].map((v) => <option key={v}>{v}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="label">Start date</label><input required type="date" className="field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div><div><label className="label">End date</label><input required type="date" min={form.startDate} className="field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div></div>
        <div><label className="label">Reason</label><textarea required minLength={5} className="field min-h-24 py-3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div><button disabled={create.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{create.isPending ? "Submitting..." : "Submit request"}</button>
      </form></DialogContent></Dialog>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>
    <div className="table-shell"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Dates</th><th className="px-5 py-4">Days</th><th className="px-5 py-4">Reason</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Review</th></tr></thead><tbody className="divide-y">{leaves.map((leave) => { const emp = map.get(leave.employeeId); return <tr key={leave._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{emp ? `${emp.firstName} ${emp.lastName}` : "Employee"}</td><td className="px-5 py-4">{leave.leaveType}</td><td className="px-5 py-4 text-muted-foreground">{new Date(leave.startDate).toLocaleDateString("en-IN")} — {new Date(leave.endDate).toLocaleDateString("en-IN")}</td><td className="px-5 py-4">{leave.totalDays}</td><td className="max-w-56 truncate px-5 py-4 text-muted-foreground">{leave.reason}</td><td className="px-5 py-4"><StatusPill status={leave.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{leave.status === "PENDING" ? <><button onClick={() => review.mutate({ id: leave._id, status: "APPROVED" })} className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600" title="Approve"><CheckCircle2 className="size-4" /></button><button onClick={() => review.mutate({ id: leave._id, status: "REJECTED" })} className="rounded-lg bg-rose-500/10 p-2 text-rose-600" title="Reject"><XCircle className="size-4" /></button></> : "—"}</div></td></tr>; })}</tbody></table></div>{!leaves.length && <EmptyState title="No leave requests" description="New leave requests will appear here." />}</div>
  </div>;
}
