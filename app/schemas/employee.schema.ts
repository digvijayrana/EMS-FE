import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(2),

  lastName: z.string().min(2),

  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

  email: z.union([z.literal(""), z.string().email("Enter a valid email")]).optional(),

  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),

  panNumber: z.union([z.literal(""), z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN")]).optional(),

  salary: z.coerce.number().min(0),

  allowedLeaves: z.coerce.number().min(0).max(31),

  joiningDate: z.string().min(1, "Joining date is required"),

  gender: z.enum([
    "MALE",
    "FEMALE",
    "OTHER",
  ]),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
  ]),

  overtimeRatePerHour: z.coerce.number().min(0).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
