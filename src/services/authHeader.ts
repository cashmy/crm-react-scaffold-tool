import { AxiosRequestHeaders } from "axios";

const authHeader = (): AxiosRequestHeaders => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage or another source
  if (token) {
    return { Authorization: `Bearer ${token}` } as AxiosRequestHeaders;
  }
  console.warn("No token found. Authorization header will not be set.");
  return {} as AxiosRequestHeaders;
};

export default authHeader;
