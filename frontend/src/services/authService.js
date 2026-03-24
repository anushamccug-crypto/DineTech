import axios from "axios";

// ✅ AUTOMATIC URL SWITCHER
// If the website is running on 'localhost', use your local server.
// If it's running on Vercel, use your deployed backend.
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

const API_URL = `${API_BASE_URL}/api/auth`;

export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    
    // ⭐ IMPORTANT: Save user to localStorage here so Login.js 
    // and CustomerDashboard.js both know who is logged in.
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
      // If your backend returns a token, save it too
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
    }
    
    return response.data;
  } catch (error) {
    // This will now catch "Network Error" if the backend is down
    console.error("Auth Service Error:", error);
    throw error;
  }
};

// Add this so your Register page also works on Vercel!
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};