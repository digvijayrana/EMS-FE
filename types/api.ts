import type { Employee } from "./employee";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  attendanceDate: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | "WEEK_OFF" | "HOLIDAY";
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  totalHours?: number;
  overtimeHours?: number;
  remarks?: string;
  employee?: Employee;
}

export interface LeaveRecord {
  _id: string;
  employeeId: string;
  leaveType: "CASUAL" | "SICK" | "PAID" | "UNPAID" | "EMERGENCY";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  createdAt?: string;
}

export interface SalaryAdvance {
  _id: string;
  employeeId: string;
  amount: number;
  reason: string;
  repaymentMonth: number;
  repaymentYear: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks?: string;
  createdAt?: string;
}

export interface Payroll {
  _id: string;
  employeeId: string;
  employeeCode: string;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  paidAmount: number;
  remainingAmount: number;
  overtimeAmount?: number;
  leaveDeduction?: number;
  advanceDeduction?: number;
  paymentStatus: "PENDING" | "PAID";
  generatedDate?: string;
}
