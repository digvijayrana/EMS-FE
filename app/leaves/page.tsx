"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CalendarDays, CheckCircle2, Clock3, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveLeave, cancelLeave, createLeave, deleteLeave, getLeaves, updateLeave } from "@/services/leave.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import { getApiErrorMessage } from "@/lib/api-error";
import type { LeaveRecord } from "@/types/api";
import type { Employee } from "@/types/employee";

type LeaveForm = { employeeId: string; leaveType: LeaveRecord["leaveType"]; startDate: string; endDate: string; reason: string };
const emptyForm = (): LeaveForm => ({ employeeId: "", leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<LeaveForm>(emptyForm);
  const [filters, setFilters] = useState({ search: "", status: "", leaveType: "" });
  const leavesQuery = useQuery({ queryKey: ["leaves", filters.status, filters.leaveType], queryFn: () => getLeaves({ limit: 500, ...(filters.status && { status: filters.status }), ...(filters.leaveType && { leaveType: filters.leaveType }) }) });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 500 }) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["leaves"] });
    queryClient.invalidateQueries({ queryKey: ["navbar", "pending-leaves"] });
  };
  const save = useMutation({
    mutationFn: () => editingId ? updateLeave(editingId, form) : createLeave(form),
    onSuccess: () => { toast.success(editingId ? "Leave request updated" : "Leave request created"); setOpen(false); setEditingId(undefined); setForm(emptyForm()); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save the leave request.")),
  });
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => approveLeave(id, status),
    onSuccess: (_, variables) => { toast.success(`Leave ${variables.status.toLowerCase()}`); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to review leave.")),
  });
  const cancel = useMutation({ mutationFn: cancelLeave, onSuccess: () => { toast.success("Leave request cancelled"); refresh(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Unable to cancel leave.")) });
  const remove = useMutation({ mutationFn: deleteLeave, onSuccess: () => { toast.success("Leave request deleted"); refresh(); }, onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete leave.")) });

  if (leavesQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading leave requests..." />;
  if (leavesQuery.isError || employeesQuery.isError) return <ErrorState />;
  const allLeaves: LeaveRecord[] = leavesQuery.data?.data?.data || [];
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const map = new Map(employees.map((e) => [e._id, e]));
  const leaves = allLeaves.filter((leave) => {
    const employee = map.get(leave.employeeId);
    return `${employee?.firstName || ""} ${employee?.lastName || ""} ${employee?.employeeCode || ""}`.toLowerCase().includes(filters.search.toLowerCase());
  });
  const stats = [
    { label: "All requests", value: allLeaves.length, icon: CalendarDays, tone: "bg-indigo-500/10 text-indigo-600" },
    { label: "Pending", value: allLeaves.filter((i) => i.status === "PENDING").length, icon: Clock3, tone: "bg-amber-500/10 text-amber-600" },
    { label: "Approved", value: allLeaves.filter((i) => i.status === "APPROVED").length, icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Rejected", value: allLeaves.filter((i) => i.status === "REJECTED").length, icon: XCircle, tone: "bg-rose-500/10 text-rose-600" },
  ];
  const openCreate = () => { setEditingId(undefined); setForm(emptyForm()); setOpen(true); };
  const openEdit = (leave: LeaveRecord) => { setEditingId(leave._id); setForm({ employeeId: leave.employeeId, leaveType: leave.leaveType, startDate: leave.startDate.split("T")[0], endDate: leave.endDate.split("T")[0], reason: leave.reason }); setOpen(true); };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-primary">Time away</p><h1 className="page-title">Leave requests</h1><p className="mt-2 text-sm text-muted-foreground">Create, edit, approve, reject, cancel and remove leave records.</p></div><button onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> New request</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>
    <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]"><div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="field pl-10" placeholder="Search employee..." /></div><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="field"><option value="">All statuses</option>{["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => <option key={status}>{status}</option>)}</select><select value={filters.leaveType} onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })} className="field"><option value="">All leave types</option>{["CASUAL", "SICK", "PAID", "UNPAID"].map((type) => <option key={type}>{type}</option>)}</select></div>
    <div className="table-shell"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Dates</th><th className="px-5 py-4">Days</th><th className="px-5 py-4">Reason</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{leaves.map((leave) => { const employee = map.get(leave.employeeId); return <tr key={leave._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}<p className="mt-0.5 text-xs font-normal text-muted-foreground">{employee?.employeeCode}</p></td><td className="px-5 py-4">{leave.leaveType}</td><td className="px-5 py-4 text-muted-foreground">{new Date(leave.startDate).toLocaleDateString("en-IN")} — {new Date(leave.endDate).toLocaleDateString("en-IN")}</td><td className="px-5 py-4">{leave.totalDays}</td><td className="max-w-56 truncate px-5 py-4 text-muted-foreground" title={leave.reason}>{leave.reason}</td><td className="px-5 py-4"><StatusPill status={leave.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1">{leave.status === "PENDING" && <><button onClick={() => openEdit(leave)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button><button onClick={() => review.mutate({ id: leave._id, status: "APPROVED" })} className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"><CheckCircle2 className="size-4" /></button><button onClick={() => review.mutate({ id: leave._id, status: "REJECTED" })} className="rounded-lg bg-rose-500/10 p-2 text-rose-600"><XCircle className="size-4" /></button><button onClick={() => confirm("Cancel this leave request?") && cancel.mutate(leave._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Ban className="size-4" /></button></>}<button onClick={() => confirm("Permanently remove this leave record?") && remove.mutate(leave._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"><Trash2 className="size-4" /></button></div></td></tr>; })}</tbody></table></div>{!leaves.length && <EmptyState title="No leave requests" description="Change the filters or create a new request." />}</div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editingId ? "Edit leave request" : "New leave request"}</DialogTitle><DialogDescription>{editingId ? "Pending leave requests can be updated before review." : "Submit time off on behalf of an employee."}</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4"><div><label className="label">Employee</label><select required disabled={Boolean(editingId)} className="field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select employee</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div><div><label className="label">Leave type</label><select className="field" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveForm["leaveType"] })}>{["CASUAL", "SICK", "PAID", "UNPAID"].map((value) => <option key={value}>{value}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="label">Start date</label><input required type="date" className="field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div><div><label className="label">End date</label><input required type="date" min={form.startDate} className="field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div></div><div><label className="label">Reason</label><textarea required minLength={5} className="field min-h-24 py-3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div><button disabled={save.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{save.isPending ? "Saving..." : editingId ? "Update request" : "Submit request"}</button></form></DialogContent></Dialog>
  </div>;
}
