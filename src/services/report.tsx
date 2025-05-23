import { configApi } from "../configs/ConfigAxios";
import { AxiosError } from "axios";
export const getReportCollection = async (year: number, month: number, day?: number) => {
  try {
    const url = `/api/v1/collection/collection-stats?year=${year}${month ? `&month=${month}` : ''}${day ? `&day=${day}` : ''}`;
    const response = await configApi.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};

export const getReportUser = async (year: number, month: number, day?: number) => {
  try {
    const url = `/api/v1/user/user-stats?year=${year}&month=${month}${day ? `&day=${day}` : ''}`;
    const response = await configApi.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const getReportFile = async (year: number, month: number, day?: number) => {
  try {
    const url = `/api/files/file-stats?year=${year}&month=${month}${day ? `&day=${day}` : ''}`;
    const response = await configApi.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};


export const getUserFileDetails = async (year: number, month: number, day?: number) => {
  try {
    const url = `/api/files/file-user-details?year=${year}&month=${month}${day ? `&day=${day}` : ''}`;
    const response = await configApi.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.data;
  }
};
