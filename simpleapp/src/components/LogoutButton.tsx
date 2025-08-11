
import { logout } from "../api";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
    const {setIsAuthenticated}= useAuth()
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false)
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;