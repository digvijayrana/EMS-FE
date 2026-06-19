"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, Save } from "lucide-react";
import { employeeSchema, type EmployeeFormValues } from "@/app/schemas/employee.schema";

type Props = {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
  submitLabel?: string;
};

const fields = [
  { name: "firstName", label: "First name", placeholder: "Aarav" },
  { name: "lastName", label: "Last name", placeholder: "Sharma" },
  { name: "phone", label: "Mobile number", placeholder: "9876543210" },
  { name: "email", label: "Email address", placeholder: "aarav@company.com", type: "email" },
  { name: "aadhaarNumber", label: "Aadhaar number", placeholder: "12 digit Aadhaar" },
  { name: "panNumber", label: "PAN number", placeholder: "ABCDE1234F" },
] as const;

export default function EmployeeForm({ defaultValues, onSubmit, submitLabel = "Save employee" }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<
    z.input<typeof employeeSchema>,
    unknown,
    EmployeeFormValues
  >({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      allowedLeaves: 2,
      salary: 0,
      overtimeRatePerHour: 0,
      gender: "MALE",
      status: "ACTIVE",
      joiningDate: new Date().toISOString().split("T")[0],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-5 sm:p-7">
      <div>
        <h2 className="text-lg font-bold">Personal information</h2>
        <p className="mt-1 text-sm text-muted-foreground">Basic identity and contact details for this employee.</p>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="label" htmlFor={field.name}>{field.label}</label>
            <input id={field.name} type={"type" in field ? field.type : "text"} {...register(field.name)} placeholder={field.placeholder} className="field" />
            {errors[field.name] && <p className="mt-1.5 text-xs text-destructive">{errors[field.name]?.message}</p>}
          </div>
        ))}
      </div>

      <div className="my-7 h-px bg-border" />
      <div>
        <h2 className="text-lg font-bold">Employment details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Compensation, joining date and account status.</p>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div><label className="label" htmlFor="salary">Monthly salary</label><input id="salary" type="number" {...register("salary")} className="field" /><p className="mt-1.5 text-xs text-destructive">{errors.salary?.message}</p></div>
        <div><label className="label" htmlFor="allowedLeaves">Allowed leaves / month</label><input id="allowedLeaves" type="number" {...register("allowedLeaves")} className="field" /><p className="mt-1.5 text-xs text-destructive">{errors.allowedLeaves?.message}</p></div>
        <div><label className="label" htmlFor="joiningDate">Joining date</label><input id="joiningDate" type="date" {...register("joiningDate")} className="field" /><p className="mt-1.5 text-xs text-destructive">{errors.joiningDate?.message}</p></div>
        <div><label className="label" htmlFor="overtimeRatePerHour">Overtime rate / hour</label><input id="overtimeRatePerHour" type="number" {...register("overtimeRatePerHour")} className="field" /></div>
        <div><label className="label" htmlFor="gender">Gender</label><select id="gender" {...register("gender")} className="field"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
        <div><label className="label" htmlFor="status">Employment status</label><select id="status" {...register("status")} className="field"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
      </div>
      <div className="mt-8 flex justify-end">
        <button disabled={isSubmitting} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
