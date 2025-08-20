import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

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
    setLoggedIn(Boolean(token));

    // If not logged in, do not populate default/sample videos.
    // Guests will see a friendly message prompting them to sign in.
    if (!token) {
      setHistory([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        "https://video-app-1l96.onrender.com/api/v1/users/history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      const res = await fetch(
        "https://video-app-1l96.onrender.com/api/v1/users/history",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
          {loggedIn && history.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="bg-red-600 hover:bg-red-500 hover:cursor-pointer hover:scale-105 transition-transform duration-100 text-white px-4 py-2 rounded-md text-[16px] shadow"
            >
              {clearing ? "Clearing..." : "Clear History"}
            </button>
          )}
          {!loggedIn && (
            <div className="flex items-center space-x-3">
              <p className="text-gray-300 mr-3 hidden sm:block">
                Sign in to save your own watch history.
              </p>
              <Link
                to="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Sign in
              </Link>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading history...</p>
          ) : error ? (
            <p className="text-center text-red-500 p-4">{error}</p>
          ) : !loggedIn && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              {/* Outline SVG icon */}
              <svg
                width="140"
                height="140"
                viewBox="0 0 24 24"
                fill="none"
                className="mb-6 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 7v6l4 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.93 4.93A10 10 0 0 1 12 2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">
                No watch history yet
              </h3>
              <p className="text-gray-400 max-w-xl">
                We don't have any watch history for your account. Sign in to
                save videos you watch and come back to them anytime.
              </p>
              <div className="mt-6"></div>
            </div>
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
