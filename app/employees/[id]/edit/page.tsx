"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import EmployeeForm from "@/components/employees/employee-form";

import {
  getEmployeeById,
  updateEmployee,
  uploadEmployeePhoto,
} from "@/services/employee.service";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLoader } from "@/components/shared/page-state";
import type { EmployeeFormValues } from "@/app/schemas/employee.schema";
import { getApiErrorMessage } from "@/lib/api-error";

export default function EditEmployeePage() {
  const params = useParams();

  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["employee", params.id],
    queryFn: () =>
      getEmployeeById(params.id as string),
  });

  const employee = data?.data;

  const handleUpdate = async (values: EmployeeFormValues, photo?: File) => {
    try {
      await updateEmployee(
        params.id as string,
        values
      );
      if (photo) {
        await uploadEmployeePhoto(params.id as string, photo);
      }

      toast.success("Employee updated successfully");
      router.push("/employees");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "We could not update the employee. Please review the form and try again."));
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

          maritalStatus:
            employee?.maritalStatus ||
            "SINGLE",

          dateOfBirth:
            employee?.dateOfBirth
              ?.split("T")[0] || "",

          status:
            employee?.status ||
            "ACTIVE",

          overtimeRatePerHour: employee?.overtimeRatePerHour ||
            0,

          departmentId: employee?.departmentId || "",

          designationId: employee?.designationId || "",

          bankDetails: {
            accountHolderName: employee?.bankDetails?.accountHolderName || "",
            accountNumber: employee?.bankDetails?.accountNumber || "",
            ifscCode: employee?.bankDetails?.ifscCode || "",
            bankName: employee?.bankDetails?.bankName || "",
            branchName: employee?.bankDetails?.branchName || "",
          },

          address: {
            line1: employee?.address?.line1 || "",
            line2: employee?.address?.line2 || "",
            city: employee?.address?.city || "",
            state: employee?.address?.state || "",
            country: employee?.address?.country || "India",
            pincode: employee?.address?.pincode || "",
          },
        }}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
        defaultPhotoUrl={employee?.photoUrl}
      />
    </div>
  );
}
