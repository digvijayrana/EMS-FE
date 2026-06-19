"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteEmployee, getEmployees } from "@/services/employee.service";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["employees", search, page], queryFn: () => getEmployees({ search, page, limit: 10 }) });
  const remove = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { toast.success("Employee removed"); queryClient.invalidateQueries({ queryKey: ["employees"] }); },
    onError: () => toast.error("Unable to remove employee"),
  });

  const employees: Employee[] = query.data?.data?.employees || [];
  const pagination = query.data?.data?.pagination || { total: 0, totalPages: 1 };
  const active = employees.filter((item) => item.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-sm font-semibold text-primary">Your workforce</p><h1 className="page-title">Employees</h1><p className="mt-2 text-sm text-muted-foreground">Manage people, compensation and employment records.</p></div>
        <Link href="/employees/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> Add employee</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: "Total employees", value: pagination.total, icon: Users, tone: "text-indigo-600 bg-indigo-500/10" }, { label: "Active on this page", value: active, icon: UserCheck, tone: "text-emerald-600 bg-emerald-500/10" }, { label: "Inactive on this page", value: employees.length - active, icon: UserX, tone: "text-rose-600 bg-rose-500/10" }].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>
        ))}
      </div>

      <div className="glass-card p-3">
        <div className="relative max-w-lg"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, code or phone..." className="field border-0 bg-transparent pl-10 shadow-none focus:ring-0" /></div>
      </div>

      {query.isLoading ? <PageLoader label="Loading employees..." /> : query.isError ? <ErrorState message="Unable to load employees." /> : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Joining date</th><th className="px-5 py-4">Salary</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y">
                {employees.map((employee) => (
                  <tr key={employee._id} className="transition hover:bg-muted/35">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white">{employee.firstName[0]}{employee.lastName[0]}</span><div><p className="font-semibold">{employee.firstName} {employee.lastName}</p><p className="mt-0.5 text-xs text-muted-foreground">{employee.employeeCode}</p></div></div></td>
                    <td className="px-5 py-4"><p>{employee.phone}</p><p className="mt-0.5 text-xs text-muted-foreground">{employee.email || "No email"}</p></td>
                    <td className="px-5 py-4 text-muted-foreground">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-5 py-4 font-semibold">{money(employee.salary)}</td>
                    <td className="px-5 py-4"><StatusPill status={employee.status} /></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1"><Link href={`/employees/${employee._id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="size-4" /></Link><Link href={`/employees/${employee._id}/edit`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-4" /></Link><button onClick={() => confirm(`Remove ${employee.firstName}?`) && remove.mutate(employee._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"><Trash2 className="size-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!employees.length && <EmptyState title="No employees found" description="Try a different search or add your first employee." />}
          <div className="flex items-center justify-between border-t px-5 py-4"><p className="text-xs text-muted-foreground">Page {page} of {pagination.totalPages || 1} · {pagination.total} records</p><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft className="size-4" /></button><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight className="size-4" /></button></div></div>
        </div>
      )}
    </div>
  );
}
