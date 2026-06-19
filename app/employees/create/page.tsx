"use client";

import { useRouter } from "next/navigation";

import EmployeeForm from "@/components/employees/employee-form";

import { createEmployee, uploadEmployeePhoto } from "@/services/employee.service";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EmployeeFormValues } from "@/app/schemas/employee.schema";
import { getApiErrorMessage } from "@/lib/api-error";

export default function CreateEmployeePage() {
  const router = useRouter();

  const handleCreate = async (values: EmployeeFormValues, photo?: File) => {
    try {
      const response = await createEmployee(values);
      const employeeId = response?.data?._id;
      if (photo && employeeId) {
        try {
          await uploadEmployeePhoto(employeeId, photo);
        } catch (photoError) {
          toast.warning(getApiErrorMessage(photoError, "Employee created, but the photo could not be uploaded."));
        }
      }

      toast.success("Employee created successfully");
      router.push("/employees");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "We could not create the employee. Please review the form and try again."));
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
