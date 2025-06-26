import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaThumbsUp, FaRegThumbsUp, FaPlus } from "react-icons/fa";
import { BsFillPersonPlusFill } from "react-icons/bs";

const VideoPage = () => {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoadingComments, setLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [creatingPlaylistModal, setCreatingPlaylistModal] = useState(false);
  const [creatingPlaylistError, setCreatingPlaylistError] = useState("");
  const [message, setMessage] = useState("");

  const hasCountedView = useRef(false);
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("username");

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

  const fetchVideo = async () => {
    const res = await fetch(`http://localhost:8000/api/v1/videos/${videoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await res.json();
    if (res.ok) setVideoData(data);
  };

  const incrementView = async () => {
    await fetch(`http://localhost:8000/api/v1/videos/${videoId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const updateWatchHistory = async () => {
    await fetch("http://localhost:8000/api/v1/users/history", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId }),
    });
  };

  const fetchComments = async (pageNumber = 1, order = sortOrder) => {
    setLoadingComments(true);
    const res = await fetch(
      `http://localhost:8000/api/v1/comment/video/${videoId}?page=${pageNumber}&sortOrder=${order}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { data } = await res.json();
    if (res.ok) {
      if (pageNumber === 1) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    }
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(
      `http://localhost:8000/api/v1/comment/add-comment/${videoId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      }
    );
    if (res.ok) {
      setNewComment("");
      fetchComments(1);
    } else {
      alert("Login to comment");
    }
  };

  const handleEditComment = async (commentId) => {
    const res = await fetch(
      `http://localhost:8000/api/v1/comment/update-comment/${commentId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      }
    );
    if (res.ok) {
      setEditingCommentId(null);
      setEditContent("");
      fetchComments(1);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const res = await fetch(
      `http://localhost:8000/api/v1/comment/delete-comment/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      fetchComments(1);
    }
  };

  const handleLike = async () => {
    const res = await fetch(
      `http://localhost:8000/api/v1/like/video/${videoId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await res.json();
    if (res.ok) {
      setVideoData((p) => ({
        ...p,
        isLiked: data.isLiked,
        likeCount: data.likeCount,
      }));
    } else {
      alert("Login to like");
    }
  };

  const handleSubscribe = async () => {
    const res = await fetch(
      `http://localhost:8000/api/v1/subscription/toggle/${videoData.owner._id}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const { data } = await res.json();
    if (res.ok) {
      setVideoData((p) => ({
        ...p,
        isSubscribed: data.isSubscribed,
        subscriberCount: data.subscriberCount,
      }));
    } else {
      alert("Login to subscribe");
    }
  };

  const fetchUserPlaylists = async () => {
    const res = await fetch(
      "http://localhost:8000/api/v1/playlist/get-user-playlists",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const { data } = await res.json();
    if (res.ok) setPlaylists(data);
  };

  const handleAddToPlaylist = async (playlistId) => {
    const res = await fetch(
      `http://localhost:8000/api/v1/playlist/add-video-to-playlist/${playlistId}/${videoId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      setMessage("Video added to playlist ✅");
      setTimeout(() => {setShowPlaylistModal(false); setMessage("");}, 1500)
    } else {
      const { message } = await res.json();
      setMessage(message || "Failed to add video");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return alert("Playlist name is required");

    setCreatingPlaylistModal(true);

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
      setPlaylists((prev) => [...prev, data]); // Add new playlist to state
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setCreatingPlaylistError(message);
    } else {
      setCreatingPlaylistError(message || "Failed to create playlist");
    }
    setTimeout(() => {
      setCreatingPlaylistError(""), setCreatingPlaylistModal(false);
    }, 1500);
  };

  useEffect(() => {
    fetchVideo();
    fetchComments(1);
  }, [videoId]);

  useEffect(() => {
    if (videoData && !hasCountedView.current) {
      hasCountedView.current = true;
      fetchUserPlaylists();
      incrementView();
      updateWatchHistory(); // 👈 Add this line
    }
  }, [videoData]);

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    setComments([]);
    setPage(1);
    fetchComments(1, newOrder);
  };

  if (!videoData) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 text-white bg-[#0f172a] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <video controls className="w-full h-[500px] bg-black rounded-lg mb-4">
          <source src={videoData.video} type="video/mp4" />
        </video>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{videoData.title}</h1>
            <p className="text-gray-400 mt-1">
              {videoData.views} views • {timeAgo(videoData.createdAt)}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className={` hover:cursor-pointer flex items-center px-3 py-2 rounded-lg ${
                videoData.isLiked ? "bg-blue-600" : "bg-gray-700"
              } hover:scale-105 transition-transform`}
            >
              {videoData.isLiked ? (
                <FaThumbsUp className="mr-2" />
              ) : (
                <FaRegThumbsUp className="mr-2" />
              )}
              {videoData.isLiked ? "Liked" : "Like"} ({videoData.likeCount})
            </button>

            <button
              onClick={() => setShowPlaylistModal(true)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg hover:scale-105 transition-transform hover:cursor-pointer"
            >
              🎶 Save to Playlist
            </button>
            {showPlaylistModal && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-[#1e293b] p-6 rounded-lg w-96">
                  <div className="flex justify-between">
                    <h3 className="text-white text-xl mb-4">Select Playlist</h3>
                    <FaPlus
                      className="text-white hover:cursor-pointer mt-1 size-6"
                      onClick={() => setCreatingPlaylistModal(true)}
                    />
                  </div>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {playlists.map((playlist) => (
                      <li
                        key={playlist._id}
                        className="bg-gray-800 p-3 rounded hover:bg-gray-700 cursor-pointer text-white"
                        onClick={() => handleAddToPlaylist(playlist._id)}
                      >
                        {playlist.name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-green-500 mt-4 transition-ease duration 1000">{message}</p>
                  <button
                    className="mt-4 bg-red-600 px-4 py-2 hover:bg-red-500 text-white hover:cursor-pointer hover:scale-105 transition-transform rounded-3xl"
                    onClick={() => setShowPlaylistModal(false)}
                  >
                    Cancel
                  </button>
                </div>
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
                    className="bg-green-600 px-4 py-2 rounded-3xl hover:bg-green-500 text-white hover:cursor-pointer mr-4 hover:scale-105 transition-transform"
                    onClick={handleCreatePlaylist}
                  >
                    Create
                  </button>
                  <button
                    className="mt-4 bg-red-600 px-4 py-2 rounded-3xl hover:bg-red-500 text-white hover:cursor-pointer ml-4 hover:scale-105 transition-transform"
                    onClick={() => setCreatingPlaylistModal(false)}
                  >
                    Cancel
                  </button>
                  <p className="text-green-500 mt-2">{creatingPlaylistError}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              className={`hover:cursor-pointer flex items-center px-3 py-2 rounded-lg ${
                videoData.isSubscribed ? "bg-red-600" : "bg-purple-700"
              } hover:scale-105 transition-transform`}
            >
              <BsFillPersonPlusFill className="mr-2" />
              {videoData.isSubscribed ? "Subscribed" : "Subscribe"} (
              {videoData.subscriberCount})
            </button>
          </div>
        </div>

        <p className="mb-6 bg-gray-800 p-4 rounded-lg text-gray-300">
          {videoData.description}
        </p>

        <div className="max-w-5xl mx-auto mt-8 bg-[#1e293b] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            <button
              onClick={toggleSortOrder}
              className="hover:cursor-pointer text-sm text-purple-400 underline"
            >
              Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>
          </div>

          <div className="flex mb-4">
            <input
              className="flex-1 rounded-l bg-gray-700 px-4 py-2 outline-none"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleAddComment}
              className="hover:cursor-pointer hover:scale-105 transition-transform rounded-r bg-purple-700 px-4 py-2 hover:bg-purple-600"
            >
              Post
            </button>
          </div>

          {comments.map((c) => (
            <div key={c._id} className="mb-3 p-3 bg-gray-800 rounded">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <img
                    src={
                      localStorage.getItem(`avatar_${c.owner}`) ||
                      "/default-avatar.png"
                    }
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">{c.owner}</p>
                    {editingCommentId === c._id ? (
                      <>
                        <textarea
                          className="w-full p-2 rounded bg-gray-700 text-white"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        ></textarea>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEditComment(c._id)}
                            className="hover:cursor-pointer bg-green-600 px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="hover:cursor-pointer bg-red-600 px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-300">
                        {c.content}{" "}
                        {c.isEdited && (
                          <span className="text-xs text-gray-400 ml-2">
                            (edited)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>{timeAgo(c.createdAt)}</p>
                  {c.owner === currentUser && editingCommentId !== c._id && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => {
                          setEditContent(c.content);
                          setEditingCommentId(c._id);
                        }}
                        className="hover:cursor-pointer hover:scale-105 hover:text-blue-400 text-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="hover:cursor-pointer hover:scale-105 hover:text-red-400 text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {page < totalPages && (
            <button
              onClick={() => fetchComments(page + 1)}
              disabled={isLoadingComments}
              className="mt-4 w-full bg-purple-600 py-2 rounded hover:bg-purple-500 hover:cursor-pointer"
            >
              {isLoadingComments ? "Loading..." : "Load more comments"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
