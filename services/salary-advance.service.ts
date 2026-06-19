import api from "@/lib/api";

export const getSalaryAdvances = async (params?: Record<string, string | number>) => {
  const response = await api.get("/salary-advances", { params });
  return response.data;
};

export const getSalaryAdvanceStatistics = async () => {
  const response = await api.get("/salary-advances/statistics");
  return response.data;
};

export const createSalaryAdvance = async (payload: Record<string, unknown>) => {
  const response = await api.post("/salary-advances", payload);
  return response.data;
};

export const approveSalaryAdvance = async (id: string, status: "APPROVED" | "REJECTED", remarks?: string) => {
  const response = await api.patch(`/salary-advances/${id}/approve`, { status, remarks });
  return response.data;
};
