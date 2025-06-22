import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const Landing = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/videos/get-all-videos"
      );
      const data = await response.json();
      setVideos(data.data.videos); 
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      <main className="flex-1 flex flex-col">
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

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading videos...</p>
          ) : (
            <section className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto hover:cursor-pointer">
              {videos.map((video, idx) => (
                <Link to={`/video/${video._id}`}>
                  <div
                    key={idx}
                    className="bg-[#1e293b] rounded-xl overflow-hidden shadow-md"
                  >
                    <div
                      className="h-40 bg-gray-700"
                      style={{
                        backgroundImage: `url(${video.thumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    <div className="p-4 space-y-1">
                      <h3 className="text-md font-semibold">{video.title}</h3>
                      <p className="text-sm text-gray-400">
                        {video.owner?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {video.views || 0} views •{" "}
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Landing;
