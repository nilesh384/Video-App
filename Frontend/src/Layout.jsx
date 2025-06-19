import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Components/Navbar";
import ScrollToTop from "./Assets/ScrollToTop";
import Sidebar from "./Components/Sidebar";

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </>
  );
}
