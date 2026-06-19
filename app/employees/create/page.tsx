"use client";

import { useRouter } from "next/navigation";

import EmployeeForm from "@/components/employees/employee-form";

import { createEmployee } from "@/services/employee.service";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EmployeeFormValues } from "@/app/schemas/employee.schema";

export default function CreateEmployeePage() {
  const router = useRouter();

  const handleCreate = async (values: EmployeeFormValues) => {
    try {
      await createEmployee(values);

      toast.success("Employee created successfully");
      router.push("/employees");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Failed to create employee");
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><Link href="/employees" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to employees</Link><h1 className="page-title">Add a new employee</h1><p className="mt-2 text-sm text-muted-foreground">Create a complete employee profile for your organization.</p></div>

      <EmployeeForm
        onSubmit={handleCreate}
        submitLabel="Create employee"
      />
    </div>
  );
}
