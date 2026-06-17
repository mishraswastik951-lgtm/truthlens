// frontend/src/api/newsApi.js
import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Axios instance with defaults
const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — log requests in dev
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    console.error("API Error:", msg);
    return Promise.reject(error);
  }
);

// ── API Functions ──────────────────────────────────────────────

/** Analyze a news article */
export const analyzeNews = (text, sourceUrl = "", userId = "anonymous") =>
  api.post("/predict", { text, source_url: sourceUrl, user_id: userId });

/** Get dashboard statistics */
export const getDashboard = () => api.get("/dashboard");

/** Get user analysis history */
export const getHistory = (userId) =>
  api.get(`/history?user_id=${userId}`);

/** Check API health */
export const checkHealth = () => api.get("/health");

/** Get live news feed */
export const getLiveNews = () => api.get("/live-news");

/** Send chat message to TruthBot */
export const sendChatMessage = (message) =>
  api.post("/chat", { message });

export default api;