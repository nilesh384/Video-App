import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";

const PlayLists= () => {
  const { videoId } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));
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
    // if not logged in, skip calling protected endpoint
    if (!token) {
      setLoggedIn(false);
      setPlaylists([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://video-app-1l96.onrender.com/api/v1/playlist/get-user-playlists",
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
      "https://video-app-1l96.onrender.com/api/v1/playlist/create-playlist",
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
  // deletion of permanent playlists will be prevented by the backend (403)
      const res = await fetch(
        `https://video-app-1l96.onrender.com/api/v1/playlist/delete-playlist/${deleteConfirmModal.id}`,
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
      const playlistId = selectedPlaylistId || (displayPlaylists.length > 0 ? displayPlaylists[0]._id : null);
      const videoId = deleteConfirmModal.id;
      if (!playlistId) {
        console.error("No playlist selected to delete video from");
        setDeleteConfirmModal({ show: false, type: "", id: "" });
        return;
      }
      await fetch(
        `https://video-app-1l96.onrender.com/api/v1/playlist/delete-video-from-playlist/${playlistId}/${videoId}`,
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

  // Build a display list where server-provided Watch later (or any isPermanent playlist) appears first
  const displayPlaylists = [...playlists].sort((a, b) => {
    const aIsWL = Boolean(a?.isPermanent) || a?.name === "Watch later";
    const bIsWL = Boolean(b?.isPermanent) || b?.name === "Watch later";
    if (aIsWL && !bIsWL) return -1;
    if (!aIsWL && bIsWL) return 1;
    return 0;
  });

  // Default-resolve selection: if nothing selected, prefer server-provided Watch later first
  const resolvedSelectedPlaylist =
    selectedPlaylist || (displayPlaylists.length > 0 ? displayPlaylists[0] : null);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-[#1e293b] px-4 py-3 shadow-md">
          <h2 className="text-xl font-bold">📃 Your Playlists</h2>
          {loggedIn ? (
            <FaPlus
              className="text-2xl hover:cursor-pointer hover:text-purple-500 hover:scale-125 transition-all duration-200"
              onClick={() => setCreatingPlaylistModal(true)}
            />
          ) : (
            <div className="flex items-center space-x-3">
              <p className="text-gray-300 mr-3 hidden sm:block">Sign in to create playlists</p>
              <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">Sign in</Link>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p>Loading playlists...</p>
          ) : !loggedIn ? (
            <div className="flex flex-col items-center justify-center py-20 text-center w-full px-4">
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none" className="mb-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="5" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
                <rect x="3" y="11" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
                <rect x="3" y="17" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/>
                <circle cx="21" cy="9" r="2.3" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
              <h3 className="text-2xl font-semibold mb-2">Create playlists and save videos</h3>
              <p className="text-gray-400 max-w-xl mb-6">Playlists let you organize videos into collections — sign in to create playlists, save videos, and keep everything synced across devices.</p>
              
            </div>
          ) : playlists.length === 0 && displayPlaylists.length <= 1 ? (
            <p>No playlists found.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {displayPlaylists.map((playlist) => (
                <div
                  key={playlist._id}
                  className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition relative ${
                    selectedPlaylistId === playlist._id ? "border border-purple-500" : ""
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
                      {!(playlist.isPermanent || playlist.name === "Watch later") && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{playlist.description || "No description"}</p>
                  <p className="text-sm text-gray-300 mt-2">🎥 {playlist.videos.length} video{playlist.videos.length !== 1 && "s"}</p>
                </div>
              ))}
            </div>
        
      )}

        </div>

      {resolvedSelectedPlaylist && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">📺 {resolvedSelectedPlaylist.name} - Videos</h2>
          {resolvedSelectedPlaylist.videos.length === 0 ? (
            <p>No videos in this playlist.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {resolvedSelectedPlaylist.videos.map((video) => (
                <div key={video._id} className="bg-gray-800 rounded-lg p-4 relative group hover:cursor-pointer hover:scale-105 transition duration-200">
                  <div onClick={() => navigate(`/video/${video._id}`)} className="cursor-pointer">
                    <div className="w-full h-48 bg-black mb-2 rounded-lg overflow-hidden">
                      <img src={video.thumbnail || "/default-thumbnail.jpg"} alt={video.title} className="w-full h-full object-cover" onError={(e) => (e.target.src = "/default-thumbnail.jpg")} />
                    </div>
                    <h3 className="text-lg font-semibold">{video.title}</h3>
                    <div className="flex space-x-2">
                      <img src={video.owner?.avatar} alt={video.owner?.username} className="w-6 h-6 rounded-full" />
                      <p className="text-sm text-gray-400">{video.owner?.username || "Unknown"}</p>
                    </div>
                  </div>
                  {!(resolvedSelectedPlaylist.isPermanent || resolvedSelectedPlaylist.name === "Watch later") && (
                    <div className="group absolute w-fit bottom-9 right-4">
                      <FaTrash className="text-xl text-red-500 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110 transition-transform duration-200" onClick={() => setDeleteConfirmModal({ show: true, type: "video", id: video._id })} />
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">Delete video</span>
                    </div>
                  )}
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
      </main>
    </div>
  );
};

export default PlayLists;
