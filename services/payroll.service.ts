import api from "@/lib/api";

export const getPayrolls = async (params?: Record<string, string | number>) => {
  const response = await api.get("/payroll", { params });
  return response.data;
};

export const getPayrollStatistics = async (params?: Record<string, string | number>) => {
  const response = await api.get("/payroll/statistics", { params });
  return response.data;
};

export const generatePayroll = async (payload: { employeeId: string; month: number; year: number }) => {
  const response = await api.post("/payroll", payload);
  return response.data;
};

export const markPayrollPayment = async (id: string, paidAmount: number) => {
  const response = await api.patch(`/payroll/${id}/payment`, { paidAmount });
  return response.data;
};

export const getPayrollById = async (id: string) => {
  const response = await api.get(`/payroll/${id}`);
  return response.data;
};

export const deletePayroll = async (id: string) => {
  const response = await api.delete(`/payroll/${id}`);
  return response.data;
};
