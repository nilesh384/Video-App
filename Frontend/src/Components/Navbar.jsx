import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiBell } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://video-app-1l96.onrender.com/api/v1/users/current-user",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        const data = await response.json();
        if (response.ok && data?.data) {
          setUser(data.data);
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://video-app-1l96.onrender.com/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, 
          },
          // credentials: "include", // this allows cookies like refreshToken/accessToken to be sent
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Logout successful:", data.message);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("fullname");
        localStorage.removeItem("email");
        localStorage.removeItem("avatar");
        localStorage.removeItem("coverphoto");
        localStorage.removeItem("createdAt");

        navigate("/login");
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-[#080716] via-[#120f37] to-[#11111d] text-white shadow-md">
      <nav className="flex justify-between items-center px-6 py-4 md:px-10">
        <Link to="/" className="text-2xl font-bold">
          My Tube
        </Link>

        <div className="hidden md:flex space-x-8 text-lg font-medium">
          {!user ? (
            <>
             

              <Link
                to="/signup"
                className="hover:text-purple-400 transition duration-200"
              >
                Sign Up
              </Link>

              <Link
                to="/login"
                className="hover:text-purple-400 transition duration-200"
              >
                Login
              </Link>
            </>
          ) : (
            <div className="flex items-center">
              <FiBell className="text-2xl cursor-pointer mr-10 hover:text-yellow-300 " />
              <div className="relative group">
                <div className="flex items-center gap-2.5 hover:cursor-pointer italic">
                  <p>{user.username}</p>
                  <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-purple-500"
                />
                </div>
                <div className="absolute top-full right-0 bg-gray-800 shadow-md rounded px-4 py-2 hidden group-hover:block z-50">
                  <Link
                    to="/channelDashboard"
                    className="flex items-center gap-2 hover:text-purple-300"
                  >
                    <FiUser className="text-purple-500" />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 mt-2 text-left w-full hover:text-red-400 hover:cursor-pointer"
                  >
                    <FiLogOut className="text-red-600" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hamburger for mobile */}
        <div className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <div className="space-y-1 cursor-pointer">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-lg font-medium">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block hover:text-purple-400"
          >
            Home
          </Link>
          {user && (
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white">{user.username}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
