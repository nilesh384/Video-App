import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const PlayLists= () => {
  const { videoId } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingPlaylistModal, setCreatingPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [creatingPlaylistError, setCreatingPlaylistError] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    type: "",
    id: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/playlist/get-user-playlists",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { data } = await res.json();
      if (res.ok) setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const res = await fetch(
      "http://localhost:8000/api/v1/playlist/create-playlist",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: newPlaylistDesc.trim(),
        }),
      }
    );

    const { data, message } = await res.json();

    if (res.ok) {
      setPlaylists((prev) => [...prev, data]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setCreatingPlaylistError("Playlist created ✅");
    } else {
      setCreatingPlaylistError(message || "Failed to create playlist");
    }

    setTimeout(() => {
      setCreatingPlaylistModal(false);
      setCreatingPlaylistError("");
    }, 1500);
  };

  const confirmDelete = async () => {
    if (deleteConfirmModal.type === "playlist") {
      const res = await fetch(
        `http://localhost:8000/api/v1/playlist/delete-playlist/${deleteConfirmModal.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setPlaylists((prev) =>
          prev.filter((p) => p._id !== deleteConfirmModal.id)
        );
        if (selectedPlaylistId === deleteConfirmModal.id)
          setSelectedPlaylistId(null);
      }
    } else if (deleteConfirmModal.type === "video") {
      const playlistId = selectedPlaylistId;
      const videoId = deleteConfirmModal.id;
      await fetch(
        `http://localhost:8000/api/v1/playlist/delete-video-from-playlist/${playlistId}/${videoId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPlaylists();
    }
    setDeleteConfirmModal({ show: false, type: "", id: "" });
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const selectedPlaylist = playlists.find((p) => p._id === selectedPlaylistId);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">📃 Your Playlists</h1>
        <FaPlus
          className="text-2xl hover:cursor-pointer hover:text-purple-500 hover:scale-125 transition-all duration-200"
          onClick={() => setCreatingPlaylistModal(true)}
        />
      </div>

      {loading ? (
        <p>Loading playlists...</p>
      ) : playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition relative ${
                selectedPlaylistId === playlist._id
                  ? "border border-purple-500"
                  : ""
              }`}
              onClick={() =>
                setSelectedPlaylistId(
                  selectedPlaylistId === playlist._id ? null : playlist._id
                )
              }
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{playlist.name}</h2>
                <div className="group relative w-fit">
                  <FaTrash
                    className="text-xl opacity-80 hover:text-red-500 hover:scale-125 transition cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmModal({
                        show: true,
                        type: "playlist",
                        id: playlist._id,
                      });
                    }}
                  />
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
                    Delete playlist
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {playlist.description || "No description"}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                🎥 {playlist.videos.length} video
                {playlist.videos.length !== 1 && "s"}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedPlaylist && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            📺 {selectedPlaylist.name} - Videos
          </h2>
          {selectedPlaylist.videos.length === 0 ? (
            <p>No videos in this playlist.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {selectedPlaylist.videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-gray-800 rounded-lg p-4 relative group hover:cursor-pointer hover:scale-105 transition duration-200"
                >
                  <div
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="cursor-pointer"
                  >
                    <div className="w-full h-48 bg-black mb-2 rounded-lg overflow-hidden">
                      <img
                        src={video.thumbnail || "/default-thumbnail.jpg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src = "/default-thumbnail.jpg")
                        }
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{video.title}</h3>
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
                  </div>
                  <div className="group absolute w-fit bottom-9 right-4">
                    <FaTrash
                      className="text-xl text-red-500 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 transition-transform duration-200"
                      onClick={() =>
                        setDeleteConfirmModal({
                          show: true,
                          type: "video",
                          id: video._id,
                        })
                      }
                    />

                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
                      Delete video
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {creatingPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg w-96">
            <h3 className="text-white text-xl mb-4">Create Playlist</h3>
            <input
              type="text"
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-gray-800 p-3 rounded mb-4 w-full text-white"
            />
            <input
              type="text"
              placeholder="Playlist Description"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="bg-gray-800 p-3 rounded mb-4 w-full text-white"
            />
            <button
              className="bg-green-600 px-4 py-2 rounded hover:cursor-pointer hover:bg-green-500 text-white w-full"
              onClick={handleCreatePlaylist}
            >
              Create
            </button>
            <button
              className="mt-4 bg-red-600 px-4 py-2 rounded hover:cursor-pointer hover:bg-red-500 text-white w-full"
              onClick={() => setCreatingPlaylistModal(false)}
            >
              Cancel
            </button>
            {creatingPlaylistError && (
              <p className="text-center mt-2 text-sm text-yellow-400">
                {creatingPlaylistError}
              </p>
            )}
          </div>
        </div>
      )}

      {deleteConfirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <h2 className="text-white text-xl mb-4">Are you sure?</h2>
            <div className="flex justify-end gap-4">
              <button
                className="bg-red-600 hover:bg-red-500 hover:cursor-pointer px-4 py-2 rounded text-white"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-500 hover:cursor-pointer px-4 py-2 rounded text-white"
                onClick={() =>
                  setDeleteConfirmModal({ show: false, type: "", id: "" })
                }
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayLists;
