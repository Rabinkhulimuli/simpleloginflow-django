import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MfaVerify() {
  const [otp, setOtp] = useState("");
  const redirect = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const pendingUserId = sessionStorage.getItem("pending_user");

      const payload = {
        otp: otp,
        ...(pendingUserId && { user_id: pendingUserId }),
      };

      const response = await API.post("/api/mfa/verify/", payload);

      if (response.data.verified) {
        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access);
          localStorage.setItem("refresh_token", response.data.refresh);
          sessionStorage.removeItem("pending_user");
          setIsAuthenticated(true);
          redirect("/dashboard");
          return;
        }
        setIsAuthenticated(true);
        redirect("/dashboard");
        return;
      }
    } catch (error) {
      console.error("2FA verification failed:", error);
      return false;
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl mb-4 font-bold">Verify 2FA</h2>
      <form onSubmit={handleVerify} className="space-y-3">
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full border p-2 rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Verify
        </button>
      </form>
    </div>
  );
}
