import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  // filter out entries where backend returned null (e.g., liked video was deleted)
  const visibleVideos = videos.filter((v) => v && v._id);

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

    if (diffYears >= 1)
      return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
    if (diffMonths >= 1)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    if (diffDays >= 1) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffHours >= 1)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffMinutes >= 1)
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffSeconds >= 1)
      return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
    return "just now";
  };

  const fetchLikedVideos = async () => {
    const token = localStorage.getItem("token");
    setLoggedIn(Boolean(token));

    // If not logged in, don't call the protected endpoint. Show guest placeholder.
    if (!token) {
      setVideos([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://video-app-1l96.onrender.com/api/v1/like/video", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch liked videos");

      setVideos(data.data || []);
    } catch (error) {
      console.error("Error:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
      <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md">
        <h2 className="text-xl font-bold">Liked Videos</h2>
        {loggedIn ? (
          <Link to="/yourvideos" className="bg-gray-700 text-white px-4 py-2 rounded-md">Your Videos</Link>
        ) : (
          <div className="flex items-center space-x-3">
            <p className="text-gray-300 mr-3 hidden sm:block">Sign in to save liked videos</p>
            <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Sign in</Link>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading liked videos...</p>
          ) : !loggedIn && visibleVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none" className="mb-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-xl font-semibold mb-2">No liked videos yet</h3>
              <p className="text-gray-400 max-w-xl">You haven't liked any videos. Sign in to like videos and save them to this list for later.</p>
            </div>
          ) : visibleVideos.length === 0 ? (
            <p className="text-center p-4 text-gray-400">You haven’t liked any videos yet.</p>
          ) : (
            <section className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto">
              {visibleVideos.map((video) => (
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
                      <div className="flex space-x-2">
                        <img
                          src={video.owner?.avatar}
                          alt={video.owner?.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-sm text-gray-400">{video.owner?.username || "Unknown"}</p>
                      </div>
                      <p className="text-xs text-gray-500">{video.views || 0} views • {timeAgo(video.createdAt)}</p>
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
