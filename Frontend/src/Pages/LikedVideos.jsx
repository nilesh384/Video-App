import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears >= 1) return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
    if (diffMonths >= 1) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    if (diffDays >= 1) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffHours >= 1) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffMinutes >= 1) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffSeconds >= 1) return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
    return "just now";
  };

  const fetchLikedVideos = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/api/v1/like/video", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch liked videos");

      setVideos(data.data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md">
          <h2 className="text-xl font-bold">Liked Videos</h2>
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading liked videos...</p>
          ) : videos.length === 0 ? (
            <p className="text-center p-4 text-gray-400">
              You haven’t liked any videos yet.
            </p>
          ) : (
            <section className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto">
              {videos.map((video) => (
                <Link to={`/video/${video._id}`} key={video._id}>
                  <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform">
                    <div
                      className="h-40 bg-gray-700"
                      style={{
                        backgroundImage: `url(${video.thumbnail || "/default-thumbnail.jpg"})`,
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
                        {video.views || 0} views • {timeAgo(video.createdAt)}
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

export default LikedVideos;
