import React, { use } from "react";
import { FaSearch } from "react-icons/fa";

const videos = [
  {
    title: "React Crash Course",
    channel: "DevEd",
    views: "1.2M",
    time: "2 days ago",
  },
  {
    title: "Node.js Tutorial",
    channel: "Traversy Media",
    views: "980K",
    time: "1 week ago",
  },
  {
    title: "Tailwind in 100 Seconds",
    channel: "Fireship",
    views: "300K",
    time: "4 days ago",
  },
  {
    title: "AI for Beginners",
    channel: "freeCodeCamp",
    views: "700K",
    time: "3 weeks ago",
  },
  {
    title: "Java DSA Series",
    channel: "CodeWithHarry",
    views: "1.5M",
    time: "1 month ago",
  },
];

const Landing = () => {
  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md">
          <h2 className="text-xl font-bold md:hidden">PortfolioTube</h2>
          <div className="relative w-full max-w-md mx-auto">
            <input
              className="w-full py-2 px-4 rounded-full bg-[#334155] text-white focus:outline-none"
              placeholder="Search videos..."
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
        </header>

        {/* Videos Grid */}
        <div className="flex-1 overflow-y-auto">
          <section className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto">
            {videos.map((video, idx) => (
              <div
                key={idx}
                className="bg-[#1e293b] rounded-xl overflow-hidden shadow-md"
              >
                <div className="h-40 bg-gray-700"></div>{" "}
                {/* Placeholder for thumbnail */}
                <div className="p-4 space-y-1">
                  <h3 className="text-md font-semibold">{video.title}</h3>
                  <p className="text-sm text-gray-400">{video.channel}</p>
                  <p className="text-xs text-gray-500">
                    {video.views} • {video.time}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Landing;
