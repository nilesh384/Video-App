import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ScrollToTop from "./Assets/ScrollToTop";

export default function Layout() {
    return (
        <>
            <ScrollToTop/>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
}