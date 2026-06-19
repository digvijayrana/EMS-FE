"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CircleDollarSign, Eye, Plus, Receipt, Search, Trash2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { deletePayroll, generatePayroll, getPayrolls, getPayrollStatistics, markPayrollPayment } from "@/services/payroll.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Payroll } from "@/types/api";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function PayrollPage() {
  const now = new Date();
  const queryClient = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selected, setSelected] = useState<Payroll>();
  const [paymentFor, setPaymentFor] = useState<Payroll>();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [form, setForm] = useState({ employeeId: "", month: now.getMonth() + 1, year: now.getFullYear() });
  const [filters, setFilters] = useState({ search: "", status: "", month: "", year: String(now.getFullYear()) });
  const payrollQuery = useQuery({
    queryKey: ["payroll", filters.status, filters.month, filters.year],
    queryFn: () => getPayrolls({ limit: 500, ...(filters.status && { paymentStatus: filters.status }), ...(filters.month && { month: filters.month }), ...(filters.year && { year: filters.year }) }),
  });
  const statsQuery = useQuery({ queryKey: ["payroll-statistics", filters.month, filters.year], queryFn: () => getPayrollStatistics({ ...(filters.month && { month: filters.month }), ...(filters.year && { year: filters.year }) }) });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 500 }) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["payroll"] });
    queryClient.invalidateQueries({ queryKey: ["payroll-statistics"] });
  };
  const generate = useMutation({
    mutationFn: () => generatePayroll(form),
    onSuccess: () => { toast.success("Payroll generated"); setGenerateOpen(false); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to generate payroll.")),
  });
  const pay = useMutation({
    mutationFn: () => markPayrollPayment(paymentFor!._id, Number(paymentAmount)),
    onSuccess: () => { toast.success("Payment recorded"); setPaymentFor(undefined); setPaymentAmount(""); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to record payment.")),
  });
  const remove = useMutation({
    mutationFn: deletePayroll,
    onSuccess: () => { toast.success("Payroll record deleted"); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete payroll.")),
  });

  if (payrollQuery.isLoading || statsQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading payroll..." />;
  if (payrollQuery.isError || statsQuery.isError || employeesQuery.isError) return <ErrorState />;

  const allPayrolls: Payroll[] = payrollQuery.data?.data?.data || [];
  const stats = statsQuery.data?.data || {};
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const map = new Map(employees.map((e) => [e._id, e]));
  const payrolls = allPayrolls.filter((payroll) => {
    const employee = map.get(payroll.employeeId);
    return `${employee?.firstName || ""} ${employee?.lastName || ""} ${payroll.employeeCode}`.toLowerCase().includes(filters.search.toLowerCase());
  });
  const statCards = [
    { label: "Gross payroll", value: money(stats.totalGrossSalary), icon: Receipt, tone: "bg-indigo-500/10 text-indigo-600" },
    { label: "Net payroll", value: money(stats.totalNetSalary), icon: CircleDollarSign, tone: "bg-violet-500/10 text-violet-600" },
    { label: "Total paid", value: money(stats.totalPaidAmount), icon: Banknote, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Outstanding", value: money(stats.totalRemainingAmount), icon: WalletCards, tone: "bg-amber-500/10 text-amber-600" },
  ];

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-2 text-sm font-semibold text-primary">Compensation</p><h1 className="page-title">Payroll</h1><p className="mt-2 text-sm text-muted-foreground">Generate, review, pay and remove payroll records with an auditable workflow.</p></div>
      <button onClick={() => setGenerateOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> Generate payroll</button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>

    <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_180px_150px_130px]">
      <div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="field pl-10" placeholder="Search employee or code..." /></div>
      <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="field"><option value="">All payment statuses</option><option value="PENDING">Pending</option><option value="PAID">Paid</option></select>
      <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} className="field"><option value="">All months</option>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "long" })}</option>)}</select>
      <input type="number" min="2025" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="field" aria-label="Payroll year" />
    </div>

    <div className="table-shell"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Period</th><th className="px-5 py-4">Basic</th><th className="px-5 py-4">Deductions</th><th className="px-5 py-4">Net salary</th><th className="px-5 py-4">Paid / due</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{payrolls.map((payroll) => { const employee = map.get(payroll.employeeId); return <tr key={payroll._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{employee ? `${employee.firstName} ${employee.lastName}` : payroll.employeeCode}<p className="mt-0.5 text-xs font-normal text-muted-foreground">{payroll.employeeCode}</p></td><td className="px-5 py-4">{new Date(payroll.year, payroll.month - 1).toLocaleString("en", { month: "short", year: "numeric" })}</td><td className="px-5 py-4">{money(payroll.basicSalary)}</td><td className="px-5 py-4 text-rose-600">-{money((payroll.leaveDeduction || 0) + (payroll.advanceDeduction || 0))}</td><td className="px-5 py-4 font-bold">{money(payroll.netSalary)}</td><td className="px-5 py-4"><p className="font-medium text-emerald-600">{money(payroll.paidAmount)}</p><p className="text-xs text-muted-foreground">Due {money(payroll.remainingAmount)}</p></td><td className="px-5 py-4"><StatusPill status={payroll.paymentStatus} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => setSelected(payroll)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="View payroll"><Eye className="size-4" /></button>{payroll.paymentStatus === "PENDING" && <button onClick={() => { setPaymentFor(payroll); setPaymentAmount(String(payroll.remainingAmount)); }} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700">Record payment</button>}<button onClick={() => confirm("Delete this payroll record? This action is recorded for audit.") && remove.mutate(payroll._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600" aria-label="Delete payroll"><Trash2 className="size-4" /></button></div></td></tr>; })}</tbody></table></div>{!payrolls.length && <EmptyState title="No payroll records" description="Change the filters or generate payroll for an employee." />}</div>

    <Dialog open={generateOpen} onOpenChange={setGenerateOpen}><DialogContent><DialogHeader><DialogTitle>Generate payroll</DialogTitle><DialogDescription>Salary is calculated from employee compensation, attendance, approved leave and salary advances.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); generate.mutate(); }} className="space-y-4"><div><label className="label">Employee</label><select required className="field" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}><option value="">Select employee</option>{employees.filter((e) => e.status === "ACTIVE").map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className="label">Month</label><select className="field" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "long" })}</option>)}</select></div><div><label className="label">Year</label><input type="number" min={2025} className="field" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div></div><button disabled={generate.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{generate.isPending ? "Calculating..." : "Generate payroll"}</button></form></DialogContent></Dialog>

    <Dialog open={Boolean(paymentFor)} onOpenChange={(value) => !value && setPaymentFor(undefined)}><DialogContent><DialogHeader><DialogTitle>Record payroll payment</DialogTitle><DialogDescription>Enter the amount paid now. Partial payments are supported.</DialogDescription></DialogHeader>{paymentFor && <form onSubmit={(e) => { e.preventDefault(); pay.mutate(); }} className="space-y-4"><div className="rounded-xl bg-muted p-4 text-sm"><div className="flex justify-between"><span>Net salary</span><strong>{money(paymentFor.netSalary)}</strong></div><div className="mt-2 flex justify-between"><span>Already paid</span><strong>{money(paymentFor.paidAmount)}</strong></div><div className="mt-2 flex justify-between text-primary"><span>Remaining</span><strong>{money(paymentFor.remainingAmount)}</strong></div></div><div><label className="label">Payment amount</label><input required type="number" min="1" max={paymentFor.remainingAmount} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="field" /></div><button disabled={pay.isPending} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{pay.isPending ? "Recording..." : "Record payment"}</button></form>}</DialogContent></Dialog>

    <Dialog open={Boolean(selected)} onOpenChange={(value) => !value && setSelected(undefined)}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Payroll details</DialogTitle><DialogDescription>Generated salary breakdown. Calculated payroll fields are immutable; payments and deletion remain auditable actions.</DialogDescription></DialogHeader>{selected && <div className="space-y-3 text-sm">{[
      ["Basic salary", money(selected.basicSalary)],
      ["Overtime amount", money(selected.overtimeAmount)],
      ["Leave deduction", `-${money(selected.leaveDeduction)}`],
      ["Advance deduction", `-${money(selected.advanceDeduction)}`],
      ["Gross salary", money(selected.grossSalary)],
      ["Net salary", money(selected.netSalary)],
      ["Paid amount", money(selected.paidAmount)],
      ["Remaining amount", money(selected.remainingAmount)],
    ].map(([label, value]) => <div key={label} className="flex justify-between rounded-lg border px-3 py-2.5"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>)}</div>}</DialogContent></Dialog>
  </div>;
}
