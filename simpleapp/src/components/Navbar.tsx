import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  return (
    <nav className="bg-gray-900 p-4 text-white flex justify-between">
      <Link to="/" className="font-bold">
        Simple App
      </Link>
      {!isAuthenticated ? (
        <div className="flex gap-4">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 ">
          <Link to="/dashboard">Dashboard</Link>
          <LogoutButton />
        </div>
      )}
    </nav>
  );
}
