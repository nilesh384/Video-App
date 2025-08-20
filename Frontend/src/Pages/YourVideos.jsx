import React, { useEffect, useState } from "react";
import { FaUpload, FaClock, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const YourVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      setLoggedIn(Boolean(token));

      // If not logged in, don't call the protected endpoint — show guest state instead
      if (!token) {
        setVideos([]);
        return;
      }

      const response = await fetch(
        `https://video-app-1l96.onrender.com/api/v1/videos/get-all-videos?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        setVideos(result.data.videos);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://video-app-1l96.onrender.com/api/v1/videos/${videoToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setVideos((prev) => prev.filter((v) => v._id !== videoToDelete));
      } else {
        alert(result.message || "Failed to delete video.");
      }
    } catch (error) {
      alert("Error deleting video.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setVideoToDelete(null);
    }
  };

  const handleDelete = (videoId) => {
    setVideoToDelete(videoId);
    setShowConfirm(true);
  };
  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 pt-0 pb-10">
      <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md mb-6">
        <h2 className="text-xl font-bold">Your Videos</h2>

        {loggedIn ? (
          <Link to={"/uploadvideo"}>
            <button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition-transform duration-300 px-5 py-2 text-white font-semibold shadow-lg flex items-center rounded-4xl hover:cursor-pointer">
              <FaUpload className="mr-2" />
              Upload Video
            </button>
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <p className="text-gray-300 mr-3 hidden sm:block">Sign in to upload, edit, and manage your videos.</p>
            <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Sign in</Link>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto">

        {loading ? (
          <p className="text-lg">Loading...</p>
        ) : !loggedIn && videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center w-full">
            <svg width="140" height="140" viewBox="0 0 24 24" fill="none" className="mb-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M16 10l6-4v12l-6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="7" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
</svg>
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-400 max-w-xl">You haven't uploaded any videos. Sign in to start uploading and manage your channel.</p>
            
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-[#1e293b] rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow hover:scale-105"
              >
                <Link to={`/video/${video._id}`}>
                  <img
                    src={video.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-40 object-cover rounded-md mb-4 "
                  />
                </Link>

                <h3 className="text-lg font-semibold mb-1">{video.title}</h3>

                <div className="flex items-start">
                  <div>
                    <p className="text-sm text-gray-400 flex items-center">
                      <FaClock className="mr-1" />
                      {formatDuration(video.duration || 0)}
                    </p>
                    <p className="text-sm text-gray-400">{video.views} views</p>
                  </div>

                  <div className="flex flex-col items-center ml-auto space-y-4">
                    {/* Delete Icon + Tooltip */}
                    <div className="group relative w-fit">
                      <RiDeleteBin6Fill
                        className="text-red-500 cursor-pointer ml-2 hover:scale-110 transition-transform"
                        onClick={() => handleDelete(video._id)}
                      />
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
                        Delete Video
                      </span>
                    </div>

                    {/* Edit Icon + Tooltip */}
                    <Link
                      to={`/editvideo/${video._id}`}
                      className="group relative w-fit"
                    >
                      <FaEdit className="text-blue-500 cursor-pointer ml-2 hover:scale-110 transition-transform" />
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
                        Edit Video
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl text-white w-[300px]">
            <h3 className="text-lg font-bold mb-4">Delete Video?</h3>
            <p className="text-sm text-gray-300">
              Are you sure you want to delete this video?
            </p>
            <p className="text-sm text-red-300 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 bg-gray-500 rounded hover:bg-gray-600 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-1 rounded hover:cursor-pointer ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourVideos;
