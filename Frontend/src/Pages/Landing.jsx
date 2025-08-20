import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const Landing = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

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
    if (diffMonths >= 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    if (diffDays === 0 && diffHours === 0 && diffMinutes === 0)
      return "just now";
    if (diffSeconds < 60)
      return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  };

  const fetchVideos = async (q = "") => {
    setLoading(true);
    try {
      const url = new URL(
        "https://video-app-1l96.onrender.com/api/v1/videos/get-all-videos"
      );
      // default params: fetch more results when searching
      url.searchParams.set("limit", "50");
      if (q) url.searchParams.set("query", q);

      const response = await fetch(url.toString());
      const data = await response.json();
      const fetched = data?.data?.videos || [];
      setVideos(fetched);
      setNoResults(fetched.length === 0);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchVideos();
  }, []);

  // debounce search to avoid too many requests
  useEffect(() => {
    const handler = setTimeout(() => {
      // if search box is empty, fetch all
      fetchVideos(query.trim());
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      // immediate search on Enter
      fetchVideos(query.trim());
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md">
          <h2 className="text-xl font-bold md:hidden">PortfolioTube</h2>
          <div className="relative w-full max-w-md mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              className="w-full py-2 px-4 rounded-full bg-[#334155] text-white focus:outline-none"
              placeholder="Search videos..."
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading videos...</p>
          ) : noResults ? (
            <p className="text-center p-4">No videos found for "{query}"</p>
          ) : (
            <section className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto hover:cursor-pointer">
              {videos.map((video) => (
                <Link key={video._id} to={`/video/${video._id}`}>
                  <div
                    className="bg-[#1e293b] rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform"
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
                      <div className="flex space-x-2">
                        <img
                          src={video.owner?.avatar}
                          alt={video.owner?.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-sm text-gray-400">
                          {video.owner?.username || "Unknown"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {video.views || 0} views •{" "}
                        {timeAgo(video.createdAt) || "Unknown"}
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
