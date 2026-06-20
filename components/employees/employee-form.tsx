"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BriefcaseBusiness, Building2, Camera, ImagePlus, LoaderCircle, MapPin, Save, UserRound, X } from "lucide-react";
import { employeeSchema, type EmployeeFormValues } from "@/app/schemas/employee.schema";

type Props = {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues, photo?: File, aadhaarDocument?: File) => Promise<void> | void;
  submitLabel?: string;
  defaultPhotoUrl?: string;
  defaultAadhaarDocumentUrl?: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-destructive">{message}</p> : null;
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof UserRound; title: string; description: string }) {
  return <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-0.5 text-sm text-muted-foreground">{description}</p></div></div>;
}

export default function EmployeeForm({ defaultValues, onSubmit, submitLabel = "Save employee", defaultPhotoUrl, defaultAadhaarDocumentUrl }: Props) {
  const [photo, setPhoto] = useState<File>();
  const [aadhaarDocument, setAadhaarDocument] = useState<File>();
  const [photoError, setPhotoError] = useState("");
  const previewUrl = useMemo(() => photo ? URL.createObjectURL(photo) : (defaultPhotoUrl || ""), [photo, defaultPhotoUrl]);
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
      maritalStatus: "SINGLE",
      status: "ACTIVE",
      joiningDate: new Date().toISOString().split("T")[0],
      dateOfBirth: "",
      bankDetails: { accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", branchName: "" },
      address: { line1: "", line2: "", city: "", state: "", country: "India", pincode: "" },
      ...defaultValues,
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("The selected photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setPhotoError("");
    setPhoto(file);
  };

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, photo, aadhaarDocument))} className="space-y-6">
      <section className="glass-card p-5 sm:p-7">
        <SectionHeading icon={UserRound} title="Personal information" description="Identity and contact details for the employee." />
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border bg-muted/25 p-4 sm:flex-row sm:items-center">
          <div
            className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 bg-cover bg-center text-white"
            style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined}
          >
            {!previewUrl && <Camera className="size-7" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold">Employee photo</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Upload a clear JPG, PNG or WebP image. Maximum size: 5 MB.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold transition hover:bg-muted">
                <ImagePlus className="size-4" /> {previewUrl ? "Change photo" : "Choose photo"}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="sr-only" />
              </label>
              {photo && <button type="button" onClick={() => setPhoto(undefined)} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"><X className="size-4" /> Remove selection</button>}
            </div>
            {photoError && <p className="mt-2 text-xs text-destructive">{photoError}</p>}
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div><label className="label" htmlFor="firstName">First name</label><input id="firstName" {...register("firstName")} className="field" placeholder="Aarav" /><FieldError message={errors.firstName?.message} /></div>
          <div><label className="label" htmlFor="lastName">Last name</label><input id="lastName" {...register("lastName")} className="field" placeholder="Sharma" /><FieldError message={errors.lastName?.message} /></div>
          <div><label className="label" htmlFor="phone">Mobile number</label><input id="phone" inputMode="numeric" maxLength={10} {...register("phone")} className="field" placeholder="9876543210" /><FieldError message={errors.phone?.message} /></div>
          <div><label className="label" htmlFor="email">Email address <span className="text-muted-foreground">(optional)</span></label><input id="email" type="email" {...register("email")} className="field" placeholder="aarav@company.com" /><FieldError message={errors.email?.message} /></div>
          <div><label className="label" htmlFor="aadhaarNumber">Aadhaar number</label><input id="aadhaarNumber" inputMode="numeric" maxLength={12} {...register("aadhaarNumber")} className="field" placeholder="12 digit Aadhaar" /><FieldError message={errors.aadhaarNumber?.message} /></div>
          <div><label className="label" htmlFor="panNumber">PAN number <span className="text-muted-foreground">(optional)</span></label><input id="panNumber" maxLength={10} {...register("panNumber")} className="field uppercase" placeholder="ABCDE1234F" /><FieldError message={errors.panNumber?.message} /></div>
          <div><label className="label" htmlFor="gender">Gender</label><select id="gender" {...register("gender")} className="field"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
          <div><label className="label" htmlFor="maritalStatus">Marital status</label><select id="maritalStatus" {...register("maritalStatus")} className="field"><option value="SINGLE">Single</option><option value="MARRIED">Married</option></select></div>
          <div><label className="label" htmlFor="dateOfBirth">Date of birth <span className="text-muted-foreground">(optional)</span></label><input id="dateOfBirth" type="date" max={new Date().toISOString().split("T")[0]} {...register("dateOfBirth")} className="field" /></div>
        </div>
        <div className="mt-5 rounded-2xl border bg-muted/25 p-4">
          <p className="font-semibold">Aadhaar card image</p>
          <p className="mt-1 text-xs text-muted-foreground">Upload a readable JPG, PNG or WebP image. Access is limited to authorized HR users.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold hover:bg-muted">
              <ImagePlus className="size-4" /> {aadhaarDocument || defaultAadhaarDocumentUrl ? "Change Aadhaar image" : "Upload Aadhaar image"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setAadhaarDocument(event.target.files?.[0])} />
            </label>
            {defaultAadhaarDocumentUrl && !aadhaarDocument && <a href={defaultAadhaarDocumentUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">View current image</a>}
            {aadhaarDocument && <span className="max-w-64 truncate text-xs text-muted-foreground">{aadhaarDocument.name}</span>}
          </div>
        </div>
      </section>

      <section className="glass-card p-5 sm:p-7">
        <SectionHeading icon={BriefcaseBusiness} title="Employment details" description="Role, compensation and employment status." />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div><label className="label" htmlFor="departmentId">Department <span className="text-muted-foreground">(optional)</span></label><input id="departmentId" {...register("departmentId")} className="field" placeholder="Engineering" /></div>
          <div><label className="label" htmlFor="designationId">Designation <span className="text-muted-foreground">(optional)</span></label><input id="designationId" {...register("designationId")} className="field" placeholder="Software Engineer" /></div>
          <div><label className="label" htmlFor="salary">Monthly salary</label><input id="salary" type="number" min="0" {...register("salary")} className="field" /><FieldError message={errors.salary?.message} /></div>
          <div><label className="label" htmlFor="allowedLeaves">Allowed leaves / month</label><input id="allowedLeaves" type="number" min="0" max="31" {...register("allowedLeaves")} className="field" /><FieldError message={errors.allowedLeaves?.message} /></div>
          <div><label className="label" htmlFor="joiningDate">Joining date</label><input id="joiningDate" type="date" {...register("joiningDate")} className="field" /><FieldError message={errors.joiningDate?.message} /></div>
          <div><label className="label" htmlFor="overtimeRatePerHour">Overtime rate / hour</label><input id="overtimeRatePerHour" type="number" min="0" {...register("overtimeRatePerHour")} className="field" /><FieldError message={errors.overtimeRatePerHour?.message} /></div>
          <div><label className="label" htmlFor="status">Employment status</label><select id="status" {...register("status")} className="field"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
        </div>
      </section>

      <section className="glass-card p-5 sm:p-7">
        <SectionHeading icon={MapPin} title="Residential address" description="Current address used for employee records." />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2"><label className="label" htmlFor="addressLine1">Address line 1</label><input id="addressLine1" {...register("address.line1")} className="field" placeholder="House / flat number and street" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="addressLine2">Address line 2</label><input id="addressLine2" {...register("address.line2")} className="field" placeholder="Area or landmark" /></div>
          <div><label className="label" htmlFor="city">City</label><input id="city" {...register("address.city")} className="field" /></div>
          <div><label className="label" htmlFor="state">State</label><input id="state" {...register("address.state")} className="field" /></div>
          <div><label className="label" htmlFor="country">Country</label><input id="country" {...register("address.country")} className="field" /></div>
          <div><label className="label" htmlFor="pincode">Pincode</label><input id="pincode" inputMode="numeric" maxLength={6} {...register("address.pincode")} className="field" /><FieldError message={errors.address?.pincode?.message} /></div>
        </div>
      </section>

      <section className="glass-card p-5 sm:p-7">
        <SectionHeading icon={Building2} title="Bank details" description="Bank account used for salary payments." />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div><label className="label" htmlFor="accountHolderName">Account holder name</label><input id="accountHolderName" {...register("bankDetails.accountHolderName")} className="field" /></div>
          <div><label className="label" htmlFor="accountNumber">Account number</label><input id="accountNumber" inputMode="numeric" {...register("bankDetails.accountNumber")} className="field" /><FieldError message={errors.bankDetails?.accountNumber?.message} /></div>
          <div><label className="label" htmlFor="ifscCode">IFSC code</label><input id="ifscCode" maxLength={11} {...register("bankDetails.ifscCode")} className="field uppercase" placeholder="HDFC0001234" /><FieldError message={errors.bankDetails?.ifscCode?.message} /></div>
          <div><label className="label" htmlFor="bankName">Bank name</label><input id="bankName" {...register("bankDetails.bankName")} className="field" /></div>
          <div><label className="label" htmlFor="branchName">Branch name</label><input id="branchName" {...register("bankDetails.branchName")} className="field" /></div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border bg-background/90 p-3 shadow-xl backdrop-blur-xl">
        <button disabled={isSubmitting} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60">
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSubmitting ? "Saving employee..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
