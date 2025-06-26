import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
        "http://localhost:8000/api/v1/videos/publish-video",
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
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10 relative">
      <div className="max-w-3xl mx-auto bg-[#1e293b] p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6">Upload New Video</h2>

        <div className="mb-4">
          <label className="block mb-1">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 hover:file:cursor-pointer file:text-white hover:file:bg-purple-600"
          />
          {videoFile ? (<video
          className="w-60 h-50"
            src={videoFile ? URL.createObjectURL(videoFile) : ""}
            controls
          ></video>):(<></>)}
        </div>

        <div className="mb-4">
          <label className="block mb-1">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 hover:file:cursor-pointer file:text-white hover:file:bg-purple-600"
          />
          {thumbnailFile ? (<img
          className="w-60 h-35 mt-8"
            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""}
            alt="Thumbnail"
          />):(<></>)}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full bg-gray-700 px-4 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full bg-gray-700 px-4 py-2 rounded"
            rows="4"
          ></textarea>
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg max-w-sm text-center">
            <h3 className="text-lg font-semibold text-white mb-4 ">Login Required</h3>
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
