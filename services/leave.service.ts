import api from "@/lib/api";

export const getLeaves = async (params?: Record<string, string | number>) => {
  const response = await api.get("/leaves", { params });
  return response.data;
};

export const getLeaveStatistics = async () => {
  const response = await api.get("/leaves/statistics");
  return response.data;
};

export const createLeave = async (payload: Record<string, unknown>) => {
  const response = await api.post("/leaves", payload);
  return response.data;
};

export const approveLeave = async (id: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
  const response = await api.patch(`/leaves/${id}/approve`, { status, rejectionReason });
  return response.data;
};

export const cancelLeave = async (id: string) => {
  const response = await api.patch(`/leaves/${id}/cancel`);
  return response.data;
};
