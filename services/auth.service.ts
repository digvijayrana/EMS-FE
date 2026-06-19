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
