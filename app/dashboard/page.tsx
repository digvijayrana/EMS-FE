"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, CircleDollarSign, Clock3, TrendingUp, UserPlus, Users, Wallet } from "lucide-react";
import { getEmployees } from "@/services/employee.service";
import { getAttendance } from "@/services/attendance.service";
import { getLeaves } from "@/services/leave.service";
import { getPayrollStatistics } from "@/services/payroll.service";
import { StatusPill } from "@/components/shared/status-pill";
import { ErrorState, PageLoader } from "@/components/shared/page-state";
import type { AttendanceRecord, LeaveRecord } from "@/types/api";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
  const employeesQuery = useQuery({ queryKey: ["employees", "dashboard"], queryFn: () => getEmployees({ limit: 100 }) });
  const today = new Date().toLocaleDateString("en-CA");
  const attendanceQuery = useQuery({ queryKey: ["attendance", "dashboard", today], queryFn: () => getAttendance({ fromDate: today, toDate: today, limit: 500 }) });
  const leavesQuery = useQuery({ queryKey: ["leaves", "dashboard"], queryFn: () => getLeaves({ limit: 5 }) });
  const pendingLeavesQuery = useQuery({ queryKey: ["leaves", "dashboard", "pending"], queryFn: () => getLeaves({ status: "PENDING", limit: 1 }) });
  const payrollQuery = useQuery({ queryKey: ["payroll-statistics"], queryFn: () => getPayrollStatistics() });

  if ([employeesQuery, attendanceQuery, leavesQuery, pendingLeavesQuery, payrollQuery].some((query) => query.isLoading)) return <PageLoader label="Preparing your workspace..." />;
  if ([employeesQuery, attendanceQuery, leavesQuery, pendingLeavesQuery, payrollQuery].some((query) => query.isError)) return <ErrorState />;

  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const attendance: AttendanceRecord[] = attendanceQuery.data?.data?.data || [];
  const leaves: LeaveRecord[] = leavesQuery.data?.data?.data || [];
  const payroll = payrollQuery.data?.data || {};
  const todayRecords = attendance;
  const present = attendanceQuery.data?.data?.total
    ? todayRecords.filter((item) => item.status === "PRESENT").length
    : 0;
  const pendingLeaves = pendingLeavesQuery.data?.data?.total || 0;
  const employeeTotal = employeesQuery.data?.data?.pagination?.total || employees.length;
  const employeeMap = new Map(employees.map((item) => [item._id, `${item.firstName} ${item.lastName}`]));

  const cards = [
    { label: "Total employees", value: employeeTotal, note: `${employees.filter((e) => e.status === "ACTIVE").length} active team members`, icon: Users, color: "from-indigo-500 to-violet-600" },
    { label: "Present today", value: present, note: `${todayRecords.length} attendance records today`, icon: CalendarCheck, color: "from-emerald-500 to-teal-600" },
    { label: "Pending leaves", value: pendingLeaves, note: "Requests awaiting review", icon: Clock3, color: "from-amber-500 to-orange-500" },
    { label: "Payroll due", value: money(payroll.totalRemainingAmount), note: `${payroll.totalPayrolls || 0} payroll records`, icon: CircleDollarSign, color: "from-fuchsia-500 to-pink-600" },
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">Good to see you</p>
          <h1 className="page-title">Your people operations, at a glance.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Here&apos;s what is happening across your organization today.</p>
        </div>
        <Link href="/employees/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
          <UserPlus className="size-4" /> Add employee
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p></div>
              <span className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}><Icon className="size-5" /></span>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="size-3.5 text-emerald-500" />{note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold">Recent leave requests</h2><p className="mt-1 text-sm text-muted-foreground">Latest time-off activity</p></div>
            <Link href="/leaves" className="flex items-center gap-1 text-sm font-semibold text-primary">View all <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-5 space-y-2">
            {leaves.length ? leaves.slice(0, 5).map((leave) => (
              <div key={leave._id} className="flex flex-col gap-3 rounded-xl border p-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 font-bold text-primary">{(employeeMap.get(leave.employeeId) || "E")[0]}</span>
                  <div><p className="text-sm font-semibold">{employeeMap.get(leave.employeeId) || "Employee"}</p><p className="mt-0.5 text-xs text-muted-foreground">{leave.leaveType} · {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}</p></div>
                </div>
                <StatusPill status={leave.status} />
              </div>
            )) : <p className="py-10 text-center text-sm text-muted-foreground">No leave requests yet.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-bold">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              {[
                { href: "/attendance", label: "Mark attendance", icon: CalendarCheck, tone: "bg-emerald-500/10 text-emerald-600" },
                { href: "/leaves", label: "Review leave requests", icon: Clock3, tone: "bg-amber-500/10 text-amber-600" },
                { href: "/salary-advance", label: "Salary advances", icon: Wallet, tone: "bg-violet-500/10 text-violet-600" },
              ].map(({ href, label, icon: Icon, tone }) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-xl border p-3.5 transition hover:-translate-y-0.5 hover:bg-muted/40">
                  <span className="flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" /></span><span className="text-sm font-semibold">{label}</span></span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/15">
            <p className="text-sm font-semibold text-indigo-100">Payroll progress</p>
            <p className="mt-2 text-3xl font-bold">{money(payroll.totalPaidAmount)}</p>
            <p className="mt-1 text-xs text-indigo-100">paid across generated payrolls</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, payroll.totalNetSalary ? (payroll.totalPaidAmount / payroll.totalNetSalary) * 100 : 0)}%` }} /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
