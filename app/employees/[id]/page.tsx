"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeIndianRupee, Building2, CalendarDays, CreditCard, Mail, MapPin, Pencil, Phone, UserRound } from "lucide-react";
import { getEmployeeById } from "@/services/employee.service";
import { StatusPill } from "@/components/shared/status-pill";
import { ErrorState, PageLoader } from "@/components/shared/page-state";
import type { Employee } from "@/types/employee";

const money = (value = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ["employee", params.id], queryFn: () => getEmployeeById(params.id) });
  if (query.isLoading) return <PageLoader label="Loading employee profile..." />;
  if (query.isError || !query.data?.data) return <ErrorState message="Unable to load this employee." />;
  const employee: Employee = query.data.data;
  const name = `${employee.firstName} ${employee.lastName}`;
  const details = [
    { label: "Phone", value: employee.phone, icon: Phone },
    { label: "Email", value: employee.email || "Not provided", icon: Mail },
    { label: "Joining date", value: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not provided", icon: CalendarDays },
    { label: "Gender", value: employee.gender?.replaceAll("_", " ") || "Not provided", icon: UserRound },
    { label: "Marital status", value: employee.maritalStatus === "MARRIED" ? "Married" : "Single", icon: UserRound },
    { label: "Date of birth", value: employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString("en-IN") : "Not provided", icon: CalendarDays },
    { label: "PAN number", value: employee.panNumber || "Not provided", icon: CreditCard },
    { label: "Aadhaar", value: employee.aadhaarNumber ? `•••• •••• ${employee.aadhaarNumber.slice(-4)}` : "Not provided", icon: CreditCard },
  ];

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex items-center justify-between"><Link href="/employees" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Employees</Link><Link href={`/employees/${employee._id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"><Pencil className="size-4" /> Edit profile</Link></div>
    <section className="overflow-hidden rounded-3xl border bg-card/90 shadow-xl shadow-slate-900/5">
      <div className="h-36 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="px-5 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="grid size-24 place-items-center rounded-3xl border-4 border-card bg-[#171a32] bg-cover bg-center text-3xl font-bold text-white shadow-lg" style={employee.photoUrl ? { backgroundImage: `url("${employee.photoUrl}")` } : undefined}>{!employee.photoUrl && <>{employee.firstName[0]}{employee.lastName[0]}</>}</span>
            <div className="pb-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold sm:text-3xl">{name}</h1><StatusPill status={employee.status} /></div><p className="mt-1 text-sm text-muted-foreground">{employee.employeeCode}</p></div>
          </div>
          <div className="rounded-2xl bg-primary/8 px-5 py-3"><p className="text-xs text-muted-foreground">Monthly salary</p><p className="mt-1 text-xl font-bold text-primary">{money(employee.salary)}</p></div>
        </div>
      </div>
    </section>
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="glass-card p-5 sm:p-7"><h2 className="text-lg font-bold">Employee information</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{details.map(({ label, value, icon: Icon }) => <div key={label} className="flex gap-3 rounded-xl border p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div></div>)}</div></section>
      <div className="space-y-6">
        <section className="glass-card p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><BadgeIndianRupee className="size-5" /></span><div><p className="font-bold">Compensation</p><p className="text-xs text-muted-foreground">Salary and overtime</p></div></div><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Base salary</span><span className="font-semibold">{money(employee.salary)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Overtime / hour</span><span className="font-semibold">{money(employee.overtimeRatePerHour)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Allowed leaves</span><span className="font-semibold">{employee.allowedLeaves} days</span></div></div></section>
        <section className="glass-card p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600"><MapPin className="size-5" /></span><div><p className="font-bold">Address</p><p className="text-xs text-muted-foreground">Current residence</p></div></div><p className="mt-5 text-sm leading-6 text-muted-foreground">{employee.address ? [employee.address.line1, employee.address.line2, employee.address.city, employee.address.state, employee.address.pincode].filter(Boolean).join(", ") : "No address has been added yet."}</p></section>
        <section className="glass-card p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-sky-500/10 text-sky-600"><Building2 className="size-5" /></span><div><p className="font-bold">Bank details</p><p className="text-xs text-muted-foreground">Salary account</p></div></div>{employee.bankDetails?.accountNumber ? <div className="mt-5 space-y-2 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Account holder</span><span className="text-right font-semibold">{employee.bankDetails.accountHolderName || "—"}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Account number</span><span className="font-semibold">•••• {employee.bankDetails.accountNumber.slice(-4)}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">IFSC</span><span className="font-semibold">{employee.bankDetails.ifscCode || "—"}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Bank</span><span className="text-right font-semibold">{[employee.bankDetails.bankName, employee.bankDetails.branchName].filter(Boolean).join(", ") || "—"}</span></div></div> : <p className="mt-5 text-sm text-muted-foreground">No bank details have been added yet.</p>}</section>
      </div>
    </div>
  </div>;
}
