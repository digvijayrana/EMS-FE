"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Clock3, Plus, Timer, UserX } from "lucide-react";
import { toast } from "sonner";
import { getAttendance, markAttendance } from "@/services/attendance.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import type { AttendanceRecord } from "@/types/api";
import type { Employee } from "@/types/employee";

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", attendanceDate: new Date().toISOString().split("T")[0], status: "PRESENT", checkIn: "09:00", checkOut: "18:00", remarks: "" });
  const attendanceQuery = useQuery({ queryKey: ["attendance"], queryFn: () => getAttendance({ limit: 100 }) });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 100 }) });
  const save = useMutation({
    mutationFn: () => markAttendance({
      employeeId: form.employeeId,
      attendanceDate: form.attendanceDate,
      status: form.status,
      ...(form.status === "PRESENT" || form.status === "HALF_DAY" ? {
        checkIn: new Date(`${form.attendanceDate}T${form.checkIn}`).toISOString(),
        checkOut: new Date(`${form.attendanceDate}T${form.checkOut}`).toISOString(),
      } : {}),
      remarks: form.remarks,
    }),
    onSuccess: () => { toast.success("Attendance marked"); setOpen(false); queryClient.invalidateQueries({ queryKey: ["attendance"] }); },
    onError: (error: unknown) => toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Unable to mark attendance"),
  });

  if (attendanceQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading attendance..." />;
  if (attendanceQuery.isError || employeesQuery.isError) return <ErrorState />;

  const records: AttendanceRecord[] = attendanceQuery.data?.data?.data || [];
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const employeeMap = new Map(employees.map((item) => [item._id, item]));
  const today = new Date().toDateString();
  const todayRecords = records.filter((item) => new Date(item.attendanceDate).toDateString() === today);
  const stats = [
    { label: "Present today", value: todayRecords.filter((i) => i.status === "PRESENT").length, icon: CalendarCheck, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Absent today", value: todayRecords.filter((i) => i.status === "ABSENT").length, icon: UserX, tone: "bg-rose-500/10 text-rose-600" },
    { label: "On leave", value: todayRecords.filter((i) => i.status === "LEAVE").length, icon: Clock3, tone: "bg-sky-500/10 text-sky-600" },
    { label: "Overtime hours", value: records.reduce((sum, i) => sum + (i.overtimeHours || 0), 0).toFixed(1), icon: Timer, tone: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-sm font-semibold text-primary">Daily operations</p><h1 className="page-title">Attendance</h1><p className="mt-2 text-sm text-muted-foreground">Track daily presence, working hours and overtime.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> Mark attendance</button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Mark attendance</DialogTitle><DialogDescription>Add an attendance record for a team member.</DialogDescription></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label">Employee</label><select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="field"><option value="">Select employee</option>{employees.filter((e) => e.status === "ACTIVE").map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} · {e.employeeCode}</option>)}</select></div>
              <div><label className="label">Date</label><input type="date" max={new Date().toISOString().split("T")[0]} value={form.attendanceDate} onChange={(e) => setForm({ ...form, attendanceDate: e.target.value })} className="field" required /></div>
              <div><label className="label">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="field">{["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "WEEK_OFF", "HOLIDAY"].map((status) => <option key={status}>{status}</option>)}</select></div>
              {(form.status === "PRESENT" || form.status === "HALF_DAY") && <><div><label className="label">Check in</label><input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="field" /></div><div><label className="label">Check out</label><input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="field" /></div></>}
              <div className="sm:col-span-2"><label className="label">Remarks</label><textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="field min-h-20 py-3" placeholder="Optional note" /></div>
              <button disabled={save.isPending} className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground sm:col-span-2">{save.isPending ? "Saving..." : "Save attendance"}</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>

      <div className="table-shell">
        <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Check in</th><th className="px-5 py-4">Check out</th><th className="px-5 py-4">Overtime</th></tr></thead><tbody className="divide-y">
          {records.map((record) => { const employee = employeeMap.get(record.employeeId); const checkIn = record.checkInTime || record.checkIn; const checkOut = record.checkOutTime || record.checkOut; return <tr key={record._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}<p className="mt-0.5 text-xs font-normal text-muted-foreground">{employee?.employeeCode || record.employeeId.slice(0, 8)}</p></td><td className="px-5 py-4">{new Date(record.attendanceDate).toLocaleDateString("en-IN")}</td><td className="px-5 py-4"><StatusPill status={record.status} /></td><td className="px-5 py-4 text-muted-foreground">{checkIn ? new Date(checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td className="px-5 py-4 text-muted-foreground">{checkOut ? new Date(checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td className="px-5 py-4">{(record.overtimeHours || 0).toFixed(1)} hrs</td></tr>; })}
        </tbody></table></div>
        {!records.length && <EmptyState title="No attendance records" description="Mark attendance to see daily records here." />}
      </div>
    </div>
  );
}
