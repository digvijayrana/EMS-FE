import api from "@/lib/api";
import type { LoginPayload, LoginResponse } from "@/types/auth";

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", payload);
    return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateProfile = async (payload: { firstName: string; lastName: string }) => {
  const response = await api.put("/auth/profile", payload);
  return response.data;
};
