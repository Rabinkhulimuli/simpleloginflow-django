import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import MfaSetup from "./components/Mfasetup";
import MfaVerify from "./components/Mfaverify";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";


export default function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mfa-setup" element={<MfaSetup />} />
        <Route path="/mfa-verify" element={<MfaVerify />} />
        <Route element={<ProtectedRoute/>}>

        <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
}
