import axios from "axios";

const API_URL = "https://dine-tech-iyqs.vercel.app/";

export const loginUser = async (loginData) => {
  const response = await axios.post(`${API_URL}/login`, loginData);
  return response.data;
};
