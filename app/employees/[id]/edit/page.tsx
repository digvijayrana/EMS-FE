"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import EmployeeForm from "@/components/employees/employee-form";

import {
  getEmployeeById,
  updateEmployee,
} from "@/services/employee.service";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLoader } from "@/components/shared/page-state";
import type { EmployeeFormValues } from "@/app/schemas/employee.schema";

export default function EditEmployeePage() {
  const params = useParams();

  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["employee", params.id],
    queryFn: () =>
      getEmployeeById(params.id as string),
  });

  const employee = data?.data;

  const handleUpdate = async (values: EmployeeFormValues) => {
    try {
      await updateEmployee(
        params.id as string,
        values
      );

      toast.success("Employee updated successfully");
      router.push("/employees");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Update failed");
      throw error;
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading employee..." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><Link href="/employees" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to employees</Link><h1 className="page-title">Edit employee</h1><p className="mt-2 text-sm text-muted-foreground">Update profile and employment details.</p></div>

      <EmployeeForm
        defaultValues={{
          firstName:
            employee?.firstName || "",

          lastName:
            employee?.lastName || "",

          phone:
            employee?.phone || "",

          email:
            employee?.email || "",

          aadhaarNumber:
            employee?.aadhaarNumber || "",

          panNumber:
            employee?.panNumber || "",

          salary:
            employee?.salary || 0,

          allowedLeaves:
            employee?.allowedLeaves || 2,

          joiningDate:
            employee?.joiningDate
              ?.split("T")[0] || "",

          gender:
            employee?.gender ||
            "MALE",

          status:
            employee?.status ||
            "ACTIVE",

          overtimeRatePerHour: employee?.overtimeRatePerHour ||
            0,
        }}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
      />
    </div>
  );
}
