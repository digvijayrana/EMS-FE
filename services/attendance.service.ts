import api from "@/lib/api";

export const getAttendance = async (params?: Record<string, string | number>) => {
  const response = await api.get("/attendance", { params });
  return response.data;
};

export const markAttendance = async (payload: Record<string, unknown>) => {
  const response = await api.post("/attendance", payload);
  return response.data;
};

export const updateAttendance = async (id: string, payload: Record<string, unknown>) => {
  const response = await api.put(`/attendance/${id}`, payload);
  return response.data;
};

export const deleteAttendance = async (id: string) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};
