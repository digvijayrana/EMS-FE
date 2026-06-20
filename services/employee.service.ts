import api from "@/lib/api";
import type { Employee } from "@/types/employee";

export const getEmployees = async (params?: Record<string, string | number>) => {
    const response = await api.get("/employees", { params });
    return response.data;
};

export const getEmployeeById = async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
};

export const createEmployee = async (payload: Partial<Employee>) => {
    const response = await api.post("/employees", payload);
    return response.data;
};

export const updateEmployee = async (id: string, payload: Partial<Employee>) => {
    const response = await api.put(`/employees/${id}`, payload);
    return response.data;
};

export const deleteEmployee = async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
};

export const uploadEmployeePhoto = async (id: string, photo: File) => {
    const formData = new FormData();
    formData.append("photo", photo);
    const response = await api.patch(`/employees/${id}/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const uploadAadhaarDocument = async (id: string, document: File) => {
    const formData = new FormData();
    formData.append("document", document);
    const response = await api.patch(`/employees/${id}/aadhaar-document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const inviteEmployee = async (id: string) => {
    const response = await api.post(`/employees/${id}/invite`);
    return response.data;
};
