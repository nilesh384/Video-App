import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const UploadVideo = () => {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!loggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!videoFile || !thumbnailFile)
      return alert("Please select both video and thumbnail files");

    setIsUploading(true);
    setUploadMessage("");

    const data = new FormData();
    data.append("video", videoFile);
    data.append("thumbnail", thumbnailFile);
    data.append("title", formData.title);
    data.append("description", formData.description);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://video-app-1l96.onrender.com/api/v1/videos/publish-video",
        {
          method: "POST",
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setUploadMessage("Video uploaded successfully!");
        setFormData({ title: "", description: "", tags: "", category: "" });
        setVideoFile(null);
        setThumbnailFile(null);
        setTimeout(() => {
          navigate("/yourvideos");
          window.location.reload();
        }, 1000);
      } else {
        if (result.message === "jwt expired") {
          setLoggedIn(false);
        } else {
          throw new Error(result.message || "Upload failed");
        }
      }
    } catch (err) {
      setUploadMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 pt-0 pb-10 relative">
      <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md mb-6">
        <h2 className="text-xl font-bold">Upload Video</h2>

        {loggedIn ? (
          <Link to="/yourvideos" className="bg-gray-700 text-white px-4 py-2 rounded-md">Your Videos</Link>
        ) : (
          <div className="flex items-center space-x-3">
            <p className="text-gray-300 mr-3 hidden sm:block">Sign in to upload videos</p>
            <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Sign in</Link>
          </div>
        )}
      </header>

      {!loggedIn ? (
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 text-center">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="none" className="mb-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 16.58A5 5 0 0 0 17 7h-1.26A6 6 0 1 0 4 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M12 12v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M9 15l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
          <h3 className="text-xl font-semibold mb-2">Sign in to upload videos</h3>
          <p className="text-gray-400 max-w-xl">You must be signed in to upload videos. Signing in lets you publish, edit, and manage your uploads from your channel dashboard.</p>
          
        </div>
      ) : (
      <div className="max-w-3xl mx-auto bg-[#1e293b] p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6">Upload New Video</h2>

        <div className="mb-4 group relative w-fit">
          <label className="block mb-1">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 hover:file:cursor-pointer file:text-white hover:file:bg-purple-600"
          />
          <span className="absolute bottom-2 -left-14 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
            Choose video
          </span>

          {videoFile && (
            <video
              className="w-60 h-50 mt-4"
              src={URL.createObjectURL(videoFile)}
              controls
            ></video>
          )}
        </div>

        <div className="mb-4 group relative w-fit">
          <label className="block mb-1">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 hover:file:cursor-pointer file:text-white hover:file:bg-purple-600"
          />
          <span className="absolute bottom-2 -left-16 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
            Choose thumbnail
          </span>

          {thumbnailFile && (
            <img
              className="w-60 h-35 mt-4"
              src={URL.createObjectURL(thumbnailFile)}
              alt="Thumbnail"
            />
          )}
        </div>

        <div className="mb-4 group relative w-full">
          <input
            type="text"
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full bg-gray-700 px-4 py-2 rounded"
          />
          <span className="absolute -left-12 bottom-2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
            Title
          </span>
        </div>

        <div className="mb-4 group relative w-full">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full bg-gray-700 px-4 py-2 rounded"
            rows="4"
          ></textarea>
          <span className="absolute -left-22 bottom-12 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
            Description
          </span>
        </div>

        <button
          onClick={handleUpload}
          className="bg-gradient-to-r from-indigo-500 hover:cursor-pointer via-purple-500 to-pink-500 hover:scale-105 transition-transform duration-300 px-6 py-2 font-semibold rounded-lg shadow-lg"
          disabled={isUploading}
        >
          {isUploading ? (
            "Uploading..."
          ) : (
            <div className="flex items-center">
              <FaUpload className="inline mr-2" />
              <p>Upload Video</p>
            </div>
          )}
        </button>

        {uploadMessage && (
          <p className="mt-4 text-green-400 font-medium">{uploadMessage}</p>
        )}
      </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg max-w-sm text-center">
            <h3 className="text-lg font-semibold text-white mb-4 ">
              Login Required
            </h3>
            <p className="text-gray-300 mb-6">
              You must be logged in to upload a video.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
                className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-500 hover:cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="bg-gray-500 px-4 py-2 rounded text-white hover:bg-gray-400 hover:cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
