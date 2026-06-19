export interface Employee {
  _id: string;
  employeeCode: string;

  firstName: string;
  lastName: string;

  phone: string;
  email?: string;

  aadhaarNumber: string;
  panNumber?: string;

  salary: number;
  allowedLeaves: number;

  joiningDate: string;

  photoUrl?: string;

  status: "ACTIVE" | "INACTIVE";

  departmentId?: string;
  designationId?: string;

  gender?: "MALE" | "FEMALE" | "OTHER";

  maritalStatus?: "SINGLE" | "MARRIED";

  dateOfBirth?: string;

  overtimeRatePerHour?: number;

  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };

  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
}