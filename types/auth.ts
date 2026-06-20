export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      employeeId?: string;
      mustChangePassword?: boolean;
    };
  };
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "HR" | "EMPLOYEE";
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  employeeId?: string;
  mustChangePassword?: boolean;
}
