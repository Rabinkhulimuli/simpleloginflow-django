import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials:true
});

API.interceptors.request.use(
  (config) => {
    if (
      config.url?.includes("/api/mfa/verify") &&
      sessionStorage.getItem("pending_user")
    ) {
      return config;
    }

    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")||
      sessionStorage.getItem("mfa_setup_token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
     console.log('Request headers:', config.headers.Authorization);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem("refresh_token") ||
          sessionStorage.getItem("refresh_token");

        if (refreshToken) {
          const response = await axios.post("/api/token/refresh/", {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);
          API.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.clear();
        console.log(e);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      await API.post("/api/logout/", { refresh_token: refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("pending_user");
    sessionStorage.clear();
    window.location.href = "/login";
  }
};
