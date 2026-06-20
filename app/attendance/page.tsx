"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CalendarRange, Clock3, Pencil, Plus, Search, Timer, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";
import { deleteAttendance, getAttendance, markAttendance, markBulkAttendance, updateAttendance } from "@/services/attendance.service";
import { getEmployees } from "@/services/employee.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState, ErrorState, PageLoader } from "@/components/shared/page-state";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AttendanceRecord } from "@/types/api";
import type { Employee } from "@/types/employee";

type AttendanceForm = {
  employeeId: string;
  attendanceDate: string;
  status: AttendanceRecord["status"];
  checkIn: string;
  checkOut: string;
  remarks: string;
};

const emptyForm = (): AttendanceForm => ({
  employeeId: "",
  attendanceDate: new Date().toLocaleDateString("en-CA"),
  status: "PRESENT",
  checkIn: "09:00",
  checkOut: "18:00",
  remarks: "",
});

const timeValue = (value?: string) => value ? new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkDate, setBulkDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [bulkStatuses, setBulkStatuses] = useState<Record<string, AttendanceRecord["status"]>>({});
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<AttendanceForm>(emptyForm);
  const [filters, setFilters] = useState({ search: "", status: "", fromDate: "", toDate: "" });
  const attendanceQuery = useQuery({
    queryKey: ["attendance", filters.status, filters.fromDate, filters.toDate],
    queryFn: () => getAttendance({ limit: 500, ...(filters.status && { status: filters.status }), ...(filters.fromDate && { fromDate: filters.fromDate }), ...(filters.toDate && { toDate: filters.toDate }) }),
  });
  const employeesQuery = useQuery({ queryKey: ["employees", "options"], queryFn: () => getEmployees({ limit: 500 }) });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
    queryClient.invalidateQueries({ queryKey: ["attendance", "dashboard"] });
  };
  const payload = () => ({
    status: form.status,
    ...(form.status === "PRESENT" || form.status === "HALF_DAY" ? {
      checkIn: new Date(`${form.attendanceDate}T${form.checkIn}`).toISOString(),
      checkOut: new Date(`${form.attendanceDate}T${form.checkOut}`).toISOString(),
    } : {}),
    remarks: form.remarks,
  });
  const save = useMutation({
    mutationFn: () => editingId
      ? updateAttendance(editingId, payload())
      : markAttendance({ employeeId: form.employeeId, attendanceDate: form.attendanceDate, ...payload() }),
    onSuccess: () => { toast.success(editingId ? "Attendance updated" : "Attendance marked"); setOpen(false); setEditingId(undefined); setForm(emptyForm()); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save attendance.")),
  });
  const remove = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => { toast.success("Attendance record deleted"); refresh(); },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete attendance.")),
  });
  const bulkSave = useMutation({
    mutationFn: () => {
      const records = employees
        .filter((employee) => new Date(employee.joiningDate).toLocaleDateString("en-CA") <= bulkDate)
        .map((employee) => {
          const status = bulkStatuses[employee._id] || "PRESENT";
          return {
            employeeId: employee._id,
            status,
            ...(["PRESENT", "HALF_DAY"].includes(status) ? {
              checkIn: new Date(`${bulkDate}T09:00`).toISOString(),
              checkOut: new Date(`${bulkDate}T18:00`).toISOString(),
            } : {}),
          };
        });
      return markBulkAttendance({ attendanceDate: bulkDate, records });
    },
    onSuccess: (response) => {
      const failed = response.data?.failed || 0;
      toast.success(failed ? `Attendance saved with ${failed} skipped record(s)` : "Daily attendance saved");
      setBulkOpen(false); setBulkStatuses({}); refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save daily attendance.")),
  });

  if (attendanceQuery.isLoading || employeesQuery.isLoading) return <PageLoader label="Loading attendance..." />;
  if (attendanceQuery.isError || employeesQuery.isError) return <ErrorState />;

  const allRecords: AttendanceRecord[] = attendanceQuery.data?.data?.data || [];
  const employees: Employee[] = employeesQuery.data?.data?.employees || [];
  const employeeMap = new Map(employees.map((item) => [item._id, item]));
  const records = allRecords.filter((record) => {
    const employee = employeeMap.get(record.employeeId);
    const haystack = `${employee?.firstName || ""} ${employee?.lastName || ""} ${employee?.employeeCode || ""}`.toLowerCase();
    return haystack.includes(filters.search.toLowerCase());
  });
  const today = new Date().toLocaleDateString("en-CA");
  const todayRecords = allRecords.filter((item) => new Date(item.attendanceDate).toLocaleDateString("en-CA") === today);
  const stats = [
    { label: "Present today", value: todayRecords.filter((i) => i.status === "PRESENT").length, icon: CalendarCheck, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Absent today", value: todayRecords.filter((i) => i.status === "ABSENT").length, icon: UserX, tone: "bg-rose-500/10 text-rose-600" },
    { label: "On leave today", value: todayRecords.filter((i) => i.status === "LEAVE").length, icon: Clock3, tone: "bg-sky-500/10 text-sky-600" },
    { label: "Overtime hours", value: allRecords.reduce((sum, i) => sum + (i.overtimeHours || 0), 0).toFixed(1), icon: Timer, tone: "bg-violet-500/10 text-violet-600" },
  ];

  const openCreate = () => { setEditingId(undefined); setForm(emptyForm()); setOpen(true); };
  const openEdit = (record: AttendanceRecord) => {
    setEditingId(record._id);
    setForm({
      employeeId: record.employeeId,
      attendanceDate: new Date(record.attendanceDate).toLocaleDateString("en-CA"),
      status: record.status,
      checkIn: timeValue(record.checkInTime || record.checkIn) || "09:00",
      checkOut: timeValue(record.checkOutTime || record.checkOut) || "18:00",
      remarks: record.remarks || "",
    });
    setOpen(true);
  };
  const selectedEmployee = employees.find((employee) => employee._id === form.employeeId);
  const minimumAttendanceDate = selectedEmployee?.joiningDate
    ? new Date(selectedEmployee.joiningDate).toLocaleDateString("en-CA")
    : undefined;

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-2 text-sm font-semibold text-primary">Daily operations</p><h1 className="page-title">Attendance</h1><p className="mt-2 text-sm text-muted-foreground">Create, filter, edit and correct daily attendance records.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => setBulkOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold"><CalendarRange className="size-4" /> Daily bulk entry</button><button onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"><Plus className="size-4" /> Mark one employee</button></div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="glass-card flex items-center gap-4 p-5"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>

    <div className="glass-card grid gap-3 p-4 md:grid-cols-[1fr_180px_160px_160px]">
      <div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="field pl-10" placeholder="Search employee..." /></div>
      <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="field"><option value="">All statuses</option>{["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "WEEK_OFF", "HOLIDAY"].map((status) => <option key={status}>{status}</option>)}</select>
      <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="field" aria-label="From date" />
      <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="field" aria-label="To date" />
    </div>

    <div className="table-shell">
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b bg-muted/45 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Check in</th><th className="px-5 py-4">Check out</th><th className="px-5 py-4">Hours</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y">
        {records.map((record) => { const employee = employeeMap.get(record.employeeId); const checkIn = record.checkInTime || record.checkIn; const checkOut = record.checkOutTime || record.checkOut; return <tr key={record._id} className="hover:bg-muted/35"><td className="px-5 py-4 font-semibold">{employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}<p className="mt-0.5 text-xs font-normal text-muted-foreground">{employee?.employeeCode || record.employeeId.slice(0, 8)}</p></td><td className="px-5 py-4">{new Date(record.attendanceDate).toLocaleDateString("en-IN")}</td><td className="px-5 py-4"><StatusPill status={record.status} /></td><td className="px-5 py-4 text-muted-foreground">{checkIn ? new Date(checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td className="px-5 py-4 text-muted-foreground">{checkOut ? new Date(checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td className="px-5 py-4">{(record.workingHours || record.totalHours || 0).toFixed(1)} hrs</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => openEdit(record)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit attendance"><Pencil className="size-4" /></button><button onClick={() => confirm("Delete this attendance record?") && remove.mutate(record._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600" aria-label="Delete attendance"><Trash2 className="size-4" /></button></div></td></tr>; })}
      </tbody></table></div>
      {!records.length && <EmptyState title="No attendance records" description="Adjust the filters or mark attendance for an employee." />}
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editingId ? "Edit attendance" : "Mark attendance"}</DialogTitle><DialogDescription>{editingId ? "Correct status, times or remarks for this record." : "Add an attendance record for a team member."}</DialogDescription></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Employee</label><select required disabled={Boolean(editingId)} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="field"><option value="">Select employee</option>{employees.filter((e) => e.status === "ACTIVE" || e._id === form.employeeId).map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} · {e.employeeCode}</option>)}</select></div>
          <div><label className="label">Date</label><input type="date" disabled={Boolean(editingId)} min={minimumAttendanceDate} max={new Date().toLocaleDateString("en-CA")} value={form.attendanceDate} onChange={(e) => setForm({ ...form, attendanceDate: e.target.value })} className="field" required />{minimumAttendanceDate && <p className="mt-1 text-xs text-muted-foreground">Joining date: {new Date(selectedEmployee!.joiningDate).toLocaleDateString("en-IN")}</p>}</div>
          <div><label className="label">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceForm["status"] })} className="field">{["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "WEEK_OFF", "HOLIDAY"].map((status) => <option key={status}>{status}</option>)}</select></div>
          {(form.status === "PRESENT" || form.status === "HALF_DAY") && <><div><label className="label">Check in</label><input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="field" required /></div><div><label className="label">Check out</label><input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="field" required /></div></>}
          <div className="sm:col-span-2"><label className="label">Remarks</label><textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="field min-h-20 py-3" placeholder="Optional note" /></div>
          <button disabled={save.isPending} className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground sm:col-span-2">{save.isPending ? "Saving..." : editingId ? "Update attendance" : "Save attendance"}</button>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Daily attendance calendar</DialogTitle><DialogDescription>Select a date, then mark each eligible employee. Employees who had not joined by that date are automatically excluded.</DialogDescription></DialogHeader>
        <div className="sticky top-0 z-10 rounded-xl border bg-background p-3"><label className="label">Attendance date</label><input type="date" max={new Date().toLocaleDateString("en-CA")} value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="field max-w-56" /></div>
        <div className="space-y-2">
          {employees.map((employee) => {
            const eligible = new Date(employee.joiningDate).toLocaleDateString("en-CA") <= bulkDate;
            return <div key={employee._id} className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${!eligible ? "opacity-50" : ""}`}><div><p className="font-semibold">{employee.firstName} {employee.lastName}</p><p className="text-xs text-muted-foreground">{employee.employeeCode} · Joined {new Date(employee.joiningDate).toLocaleDateString("en-IN")}</p></div>{eligible ? <div className="grid grid-cols-3 gap-1 sm:flex">{(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE", "WEEK_OFF", "HOLIDAY"] as const).map((status) => <button key={status} type="button" onClick={() => setBulkStatuses({ ...bulkStatuses, [employee._id]: status })} className={`rounded-lg px-2.5 py-2 text-[10px] font-bold transition ${(bulkStatuses[employee._id] || "PRESENT") === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{status.replace("_", " ")}</button>)}</div> : <span className="text-xs font-semibold text-rose-600">Not joined yet</span>}</div>;
          })}
        </div>
        <button onClick={() => bulkSave.mutate()} disabled={bulkSave.isPending} className="sticky bottom-0 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg">{bulkSave.isPending ? "Saving attendance..." : "Save daily attendance"}</button>
      </DialogContent>
    </Dialog>
  </div>;
}
