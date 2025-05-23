import { AxiosError } from "axios";
import { configApi } from "../configs/ConfigAxios";
import { PaginationApi } from "../interface/pagination";

export const getUsers = async (pagination: PaginationApi) => {
  try {
    const response = await configApi.get(
      `/users?limit=${pagination.limit}&offset=${pagination.offset}`
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await configApi.get("/api/v1/user/current");
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const addUser = async (data: any) => {
  try {
    const response = await configApi.post("/users", data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const updateUser = async (data: any, userId: number) => {
  try {
    const response = await configApi.put(`users/${userId}`, data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getRoles = async () => {
  try {
    const response = await configApi.get(`users/roles`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getUserByName = async (name: string) => {
  try {
    const response = await configApi.get(`users/by-name?name=${name}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const deleteUserById = async (id: number | string) => {
  try {
    const response = await configApi.delete(`/users/by-id/${id}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getDashboard = async () => {
  try {
    const response = await configApi.get(`/dashboard`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};
