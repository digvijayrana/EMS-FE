import axios from "axios";

type ApiErrorBody = {
  message?: string;
  code?: string;
  field?: string;
  errors?: Array<{ message?: string; path?: string[] }>;
};

const fallbackByCode: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "This email address is already used by another employee.",
  PHONE_ALREADY_EXISTS: "This mobile number is already used by another employee.",
  AADHAAR_ALREADY_EXISTS: "This Aadhaar number is already registered to another employee.",
  PAN_ALREADY_EXISTS: "This PAN number is already registered to another employee.",
  DUPLICATE_RECORD: "One of these values is already registered. Please check the phone, email, Aadhaar and PAN.",
  EMPLOYEE_NOT_FOUND: "The employee record could not be found.",
  INVALID_TOKEN: "Your session has expired. Please sign in again.",
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;
  const body = error.response?.data;
  const validationMessage = body?.errors?.find((item) => item.message)?.message;
  return validationMessage || (body?.code && fallbackByCode[body.code]) || body?.message || fallback;
}
