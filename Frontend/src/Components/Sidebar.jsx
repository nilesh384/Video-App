import React from 'react'
import { FaHome, FaFire, FaThumbsUp, FaClock, FaVideo, FaUpload, FaHistory, FaUser, FaList} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";


function Sidebar() {

    const location = useLocation();

  return (
    <div>
      {/* Side Nav */}
      <aside className="w-60 h-full bg-[#111827] p-6 space-y-6 hidden md:block">
        
        <nav className="space-y-4 text-sm ">
          <NavItem icon={<FaHome />} label="Home" to="/" active={location.pathname === "/"} />
          <NavItem icon={<FaUser />} label="Dashboard" to="/channelDashboard" active={location.pathname == "/channelDashboard"} />
          <NavItem icon={<FaHistory />} label="History" to="/history" active={location.pathname === "/history"} />
          <NavItem icon={<FaVideo />} label="Your Videos" to="/yourvideos" active={location.pathname === "/yourvideos"} />
          <NavItem icon={<FaUpload />} label="Upload Video" to="/uploadvideo" active={location.pathname === "/uploadvideo"} />
          <NavItem icon={<FaFire />} label="Trending" active={location.pathname === "/trending"} />
          <NavItem icon={<FaThumbsUp />} label="Liked Videos" to="/likedVideos" active={location.pathname === "/liked"} />
          <NavItem icon={<FaList />} label="Playlists" to="/playlist" active={location.pathname === "/playlist"} />
          <NavItem icon={<FaClock />} label="Watch Later" active={location.pathname === "/watch-later"} />

        </nav>
      </aside>
    </div>
  )
}

const NavItem = ({ icon, label, to, active }) => {
  const baseClasses = "flex items-center space-x-3 cursor-pointer px-2 py-2 rounded-md transition-all text-white";
  const activeClass = active ? "bg-red-600" : "hover:bg-red-900";

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${activeClass}`}>
        <span>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <div className={`${baseClasses} ${activeClass}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export default Sidebar
