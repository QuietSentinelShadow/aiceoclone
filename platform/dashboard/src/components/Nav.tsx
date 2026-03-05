import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const { logout } = useAuth();
  const location = useLocation();

  const linkClass = (path: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-[#00e5ff]/10 text-[#00e5ff]"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <nav className="border-b border-[#2d2d44] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold">
            <span className="text-[#00e5ff]">Null</span>
            <span className="text-[#7c4dff]">Claw</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>
              Dashboard
            </Link>
            <Link to="/marketplace" className={linkClass("/marketplace")}>
              Marketplace
            </Link>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
