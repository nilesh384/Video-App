import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch video data on mount
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/v1/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (res.ok) {
          setVideoData(result.data);
          setTitle(result.data.title);
          setDescription(result.data.description);
        } else {
          setMessage("Failed to load video details");
        }
      } catch (err) {
        setMessage("Error fetching video data");
      }
    };

    fetchVideo();
  }, [videoId]);

  // Update title and description
  const handleUpdateDetails = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Video details updated successfully");
        setTimeout(() => {navigate("/yourvideos"), window.location.reload()}, 1000);
      } else {
        setMessage(result.message || "Update failed");
      }
    } catch (err) {
      setMessage("An error occurred during update");
    } finally {
      setIsUpdating(false);
    }
  };

  // Update thumbnail
  const handleThumbnailUpdate = async () => {
    if (!thumbnailFile) {
      setMessage("Select a thumbnail file first.");
      return;
    }

    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/v1/videos/update-thumbnail/${videoId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setVideoData((prev) => ({ ...prev, thumbnail: result.data.thumbnail }));
        setMessage("Thumbnail updated successfully");
        setTimeout(() => {navigate("/yourvideos"), window.location.reload()}, 10);
      } else {
        setMessage(result.message || "Thumbnail update failed");
      }
    } catch (err) {
      setMessage("Error updating thumbnail");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!videoData) return <div className="text-white px-6 py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-2xl mx-auto bg-[#1e293b] p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Edit Video</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded"
            rows={4}
          ></textarea>
        </div>

        <button
          onClick={handleUpdateDetails}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition mb-6 hover:cursor-pointer"
        >
          {isUpdating ? "Updating..." : "Update Details"}
        </button>

        <h3 className="text-lg font-semibold mb-2">Current Thumbnail</h3>
        <div className="flex">
            <img
          src={videoData.thumbnail}
          alt="Current Thumbnail"
          className="w-40 h-40 object-cover rounded mb-4"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
          className="hover:file:cursor-pointer mb-3 ml-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-semibold file:bg-purple-700 hover:file:bg-purple-600"
        />
        {thumbnailFile && 
        <img src={URL.createObjectURL(thumbnailFile)} alt="Selected Thumbnail" className="w-40 h-40 object-cover rounded mb-4" />}
        </div>

        <button
          onClick={handleThumbnailUpdate}
          disabled={isUpdating}
          className="hover:cursor-pointer bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold transition"
        >
          {isUpdating ? "Uploading..." : "Update Thumbnail"}
        </button>

        {message && <p className="text-green-400 mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default EditVideo;
