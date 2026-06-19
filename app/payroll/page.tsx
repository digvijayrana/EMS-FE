"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CircleDollarSign, Plus, Receipt, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { generatePayroll, getPayrolls, getPayrollStatistics, markPayrollPayment } from "@/services/payroll.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import type { Payroll } from "@/types/api";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function PayrollPage() {
  const now = new Date();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", month: now.getMonth() + 1, year: now.getFullYear() });
  const payrollQuery = useQuery({ queryKey: ["payroll"], queryFn: () => getPayrolls({ limit: 100 }) });
  const statsQuery = useQuery({ queryKey: ["payroll-statistics"], queryFn: () => getPayrollStatistics() });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 100 }) });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ["payroll"] }); queryClient.invalidateQueries({ queryKey: ["payroll-statistics"] }); };
  const generate = useMutation({ mutationFn: () => generatePayroll(form), onSuccess: () => { toast.success("Payroll generated"); setOpen(false); refresh(); }, onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to generate payroll") });
  const pay = useMutation({ mutationFn: (payroll: Payroll) => markPayrollPayment(payroll._id, payroll.remainingAmount), onSuccess: () => { toast.success("Payroll marked as paid"); refresh(); }, onError: () => toast.error("Unable to record payment") });
  if (payrollQuery.isLoading || statsQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading payroll..." />;
  if (payrollQuery.isError || statsQuery.isError || employeesQuery.isError) return <ErrorState />;
  const payrolls: Payroll[] = payrollQuery.data?.data?.data || [];
  const stats = statsQuery.data?.data || {};
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const map = new Map(employees.map((e) => [e._id, e]));
  const statCards = [{ label: "Gross payroll", value: money(stats.totalGrossSalary), icon: Receipt, tone: "bg-indigo-500/10 text-indigo-600" }, { label: "Net payroll", value: money(stats.totalNetSalary), icon: CircleDollarSign, tone: "bg-violet-500/10 text-violet-600" }, { label: "Total paid", value: money(stats.totalPaidAmount), icon: Banknote, tone: "bg-emerald-500/10 text-emerald-600" }, { label: "Outstanding", value: money(stats.totalRemainingAmount), icon: WalletCards, tone: "bg-amber-500/10 text-amber-600" }];
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold text-primary">Compensation</p><h1 className="page-title">Payroll</h1><p className="mt-2 text-sm text-muted-foreground">Generate monthly payroll and record salary payments.</p></div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> Generate payroll</button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Generate payroll</DialogTitle><DialogDescription>Calculate salary from attendance, leave and advances.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); generate.mutate(); }} className="space-y-4"><div><label className="label">Employee</label><select required className="field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select employee</option>{employees.filter((e) => e.status === "ACTIVE").map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="label">Month</label><select className="field" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "long" })}</option>)}</select></div><div><label className="label">Year</label><input type="number" min={2025} className="field" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div></div><button disabled={generate.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{generate.isPending ? "Calculating..." : "Generate payroll"}</button></form></DialogContent></Dialog></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>
    <div className="table-shell"><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Period</th><th className="px-5 py-4">Basic</th><th className="px-5 py-4">Deductions</th><th className="px-5 py-4">Net salary</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Payment</th></tr></thead><tbody className="divide-y">{payrolls.map((payroll) => { const emp = map.get(payroll.employeeId); return <tr key={payroll._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{emp ? `${emp.firstName} ${emp.lastName}` : payroll.employeeCode}<p className="mt-0.5 text-xs font-normal text-muted-foreground">{payroll.employeeCode}</p></td><td className="px-5 py-4">{new Date(payroll.year, payroll.month - 1).toLocaleString("en", { month: "short", year: "numeric" })}</td><td className="px-5 py-4">{money(payroll.basicSalary)}</td><td className="px-5 py-4 text-rose-600">-{money((payroll.leaveDeduction || 0) + (payroll.advanceDeduction || 0))}</td><td className="px-5 py-4 font-bold">{money(payroll.netSalary)}</td><td className="px-5 py-4"><StatusPill status={payroll.paymentStatus} /></td><td className="px-5 py-4 text-right">{payroll.paymentStatus === "PENDING" ? <button onClick={() => confirm(`Record payment of ${money(payroll.remainingAmount)}?`) && pay.mutate(payroll)} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700">Pay {money(payroll.remainingAmount)}</button> : <span className="text-xs text-muted-foreground">Completed</span>}</td></tr>; })}</tbody></table></div>{!payrolls.length && <EmptyState title="No payroll generated" description="Generate monthly payroll to see salary records." />}</div>
  </div>;
}
