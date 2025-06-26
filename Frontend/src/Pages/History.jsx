import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const timeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = now - created;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years >= 1) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months >= 1) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes >= 1) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (seconds > 10) return `${seconds} seconds ago`;
    return "just now";
  };

  const fetchHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }

      // Sort by watchedAt (descending)
      const sorted = [...(data.data || [])].sort(
        (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)
      );

      setHistory(sorted);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const token = localStorage.getItem("token");
    setClearing(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/history", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to clear history");
      setHistory([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md">
          <h2 className="text-xl font-bold">Watch History</h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="bg-red-600 hover:bg-red-500 hover:cursor-pointer hover:scale-105 transition-transform duration-100 text-white px-4 py-2 rounded-md text-[16px] shadow"
            >
              {clearing ? "Clearing..." : "Clear History"}
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading history...</p>
          ) : error ? (
            <p className="text-center text-red-500 p-4">{error}</p>
          ) : history.length === 0 ? (
            <p className="text-center p-4 text-gray-400">
              Your watch history is empty.
            </p>
          ) : (
            <section className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {history.map((video) => (
                <Link to={`/video/${video._id}`} key={video._id}>
                  <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform">
                    <div
                      className="h-40 bg-gray-700"
                      style={{
                        backgroundImage: `url(${
                          video.thumbnail || "/default-thumbnail.jpg"
                        })`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    <div className="p-4 space-y-1">
                      <h3 className="text-md font-semibold truncate">
                        {video.title}
                      </h3>
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
                        {video.views || 0} views • {timeAgo(video.createdAt)}
                      </p>
                      {video.watchedAt && (
                        <div className="flex">
                          <p className="text-[11px] text-gray-400">
                            Last watched:
                          </p>
                          <p className="text-[11px] ml-1 text-blue-400">
                            {timeAgo(video.watchedAt)}
                          </p>
                        </div>
                      )}
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

export default History;
