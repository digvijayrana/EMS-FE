import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PRESENT: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PAID: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HALF_DAY: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  LEAVE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  HOLIDAY: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  WEEK_OFF: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  INACTIVE: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  ABSENT: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  REJECTED: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  CANCELLED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", colors[status] || colors.INACTIVE)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
