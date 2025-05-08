import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // Check if storedUser is not null and is a valid JSON string
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/users/logout", {
        method: "POST",
        credentials: "include", // This ensures cookies are sent with the request
      });

      if (response.ok) {
        const data = await response.json();  // Parse the JSON response here
        console.log("Logout response:", data);  // Check the response content
        setUser(null);
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
        <div className="text-2xl font-bold">Portfolio</div>

        <div className="hidden md:flex space-x-8 text-lg font-medium">
          <Link to="/" className="hover:text-purple-400 transition duration-200">Home</Link>

          {!user ? (
            <>
              <Link to="/signup" className="hover:text-purple-400 transition duration-200">Sign Up</Link>
              <Link to="/login" className="hover:text-purple-400 transition duration-200">Login</Link>
            </>
          ) : (
            <div className="relative group">
              <button className="hover:text-purple-400">{user.username}</button>
              <div className="absolute top-full right-0 bg-gray-800 shadow-md rounded px-4 py-2 hidden group-hover:block">
                <Link to="/profile" className="block hover:text-purple-300">Profile</Link>
                <button onClick={handleLogout} className="block mt-2 text-left w-full hover:text-red-400">Logout</button>
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
          <Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-purple-400">Home</Link>
          {!user ? (
            <>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="block hover:text-purple-400">Sign Up</Link>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block hover:text-purple-400">Login</Link>
            </>
          ) : (
            <>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block hover:text-purple-400">Profile</Link>
              <button onClick={handleLogout} className="block w-full text-left hover:text-red-400">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
