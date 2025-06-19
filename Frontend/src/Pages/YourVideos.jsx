import React from "react";
import { FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";

const YourVideos = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Your Videos</h2>

          <Link to={"/uploadvideo"}>
            <button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition-transform duration-300 px-5 py-2 text-white font-semibold shadow-lg flex items-center rounded-4xl hover:cursor-pointer">
              <FaUpload className="mr-2" />
              Upload Video
            </button>
          </Link>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-[#1e293b] rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-700 h-40 mb-4 rounded-md animate-pulse"></div>
              <h3 className="text-lg font-semibold mb-1">
                Video Title {index + 1}
              </h3>
              <p className="text-sm text-gray-400">
                Views: {Math.floor(Math.random() * 1000)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourVideos;
