import { z } from "zod";

const optionalText = (max = 150) => z.string().trim().max(max).optional();
const optionalDate = z.union([z.literal(""), z.string()]).optional();

export const employeeSchema = z.object({
  firstName: z.string().trim().min(2, "First name must contain at least 2 characters").max(50),
  lastName: z.string().trim().min(2, "Last name must contain at least 2 characters").max(50),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address")]).optional(),
  aadhaarNumber: z.string().trim().regex(/^\d{12}$/, "Aadhaar must contain exactly 12 digits"),
  panNumber: z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter PAN in format ABCDE1234F")]).optional(),
  salary: z.coerce.number().min(0, "Salary cannot be negative"),
  allowedLeaves: z.coerce.number().min(0).max(31),
  joiningDate: z.string().min(1, "Joining date is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  maritalStatus: z.enum(["SINGLE", "MARRIED"]),
  dateOfBirth: optionalDate,
  status: z.enum(["ACTIVE", "INACTIVE"]),
  departmentId: optionalText(80),
  designationId: optionalText(80),
  overtimeRatePerHour: z.coerce.number().min(0, "Overtime rate cannot be negative").optional(),
  bankDetails: z.object({
    accountHolderName: optionalText(100),
    accountNumber: z.union([z.literal(""), z.string().regex(/^\d{9,18}$/, "Account number must contain 9 to 18 digits")]).optional(),
    ifscCode: z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code")]).optional(),
    bankName: optionalText(100),
    branchName: optionalText(100),
  }),
  address: z.object({
    line1: optionalText(),
    line2: optionalText(),
    city: optionalText(80),
    state: optionalText(80),
    country: optionalText(80),
    pincode: z.union([z.literal(""), z.string().regex(/^\d{6}$/, "Pincode must contain 6 digits")]).optional(),
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
