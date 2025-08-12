import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await API.post("/api/login/", form);

      if (res.data.mfa_required) {
        sessionStorage.setItem("mfa_temp_token", res.data.access);
        sessionStorage.setItem("pending_user", res.data.user_id);
        navigate("/mfa-verify");
      } else if (res.data.setup_required) {
        sessionStorage.setItem("mfa_setup_token", res.data.access);
        sessionStorage.setItem("pending_user", res.data.user_id);
        console.log("seeeion data", sessionStorage.getItem("mfa_setup_token"));
        navigate("/mfa-setup");
      } else {
        secureStoreTokens(res.data.access, res.data.refresh);
        navigate("/");
      }

    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const secureStoreTokens = (access: string, refresh: string) => {
    try {
      sessionStorage.setItem("access_token", access);

      if (process.env.NODE_ENV === "production") {
        document.cookie = `refresh_token=${refresh}; Path=/; Secure; SameSite=Strict; HttpOnly`;
      } else {
        sessionStorage.setItem("refresh_token", refresh);
      }
    } catch (err) {
      console.error("Token storage failed:", err);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl mb-4 font-bold">Login</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
        />
        <button
          className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
