import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { BsFillPersonPlusFill } from "react-icons/bs";

const VideoPage = () => {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const hasCountedView = useRef(false);  


  const token = localStorage.getItem("token");

  const fetchVideo = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/videos/${videoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setVideoData(data.data);
        setLiked(data.data.isLiked);
        setLikeCount(data.data.likeCount);
        setSubscribed(data.data.isSubscribed);
        setSubscriberCount(data.data.subscriberCount);

      }
    } catch (err) {
      console.error("Failed to load video:", err);
    }
  };

  const incrementView = async () => {
  try {
    await fetch(`http://localhost:8000/api/v1/videos/${videoId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Failed to increment view:", err);
  }
};

  useEffect(() => {
  fetchVideo();
}, [videoId]);

useEffect(() => {
  if (videoData && !hasCountedView.current) {
    hasCountedView.current = true;  // mark as counted
    incrementView();
  }
}, [videoData]);



  const handleSubscribe = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/subscription/toggle/${videoData.owner._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setSubscribed((prev) => !prev);
        setSubscriberCount((prev) => (subscribed ? prev - 1 : prev + 1));
        console.log(data.message);
      } else {
        console.error("Subscription failed:", data.message);
      }
    } catch (err) {
      console.error("Subscription error:", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/like/video/${videoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        console.log(data.message);
      } else {
        console.error("Error from backend:", data.message);
      }
    } catch (err) {
      console.error("Failed to like/unlike video:", err);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments((prev) => [
        ...prev,
        { text: newComment, timestamp: new Date() },
      ]);
      setNewComment("");
    }
  };

  if (!videoData) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-4">
          <video controls className="w-full h-[500px]">
            <source src={videoData.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Title & Actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{videoData.title}</h1>
            <p className="text-gray-400 text-sm">
              {videoData.views || 0} views
            </p>
          </div>

          <div className="flex space-x-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center px-3 py-2 rounded-lg ${
                liked ? "bg-blue-600" : "bg-gray-700"
              } hover:scale-105 transition-transform`}
            >
              {liked ? (
                <FaThumbsUp className="mr-2" />
              ) : (
                <FaRegThumbsUp className="mr-2" />
              )}
              {liked ? "Liked" : "Like"} ({likeCount})
            </button>

            {/* Subscribe */}
            <button
              onClick={handleSubscribe}
              className={`flex items-center px-3 py-2 rounded-lg ${
                subscribed ? "bg-red-600" : "bg-purple-700"
              } hover:scale-105 transition-transform`}
            >
              <BsFillPersonPlusFill className="mr-2" />
              {subscribed ? "Subscribed" : "Subscribe"} ({subscriberCount})
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 text-gray-300 bg-gray-800 rounded-lg p-4 ">
          {videoData.description}
        </p>

        {/* Comments Section */}
        <div className="bg-[#1e293b] p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>

          {/* New Comment Input */}
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-gray-700 px-4 py-2 rounded-l outline-none"
            />
            <button
              onClick={handleAddComment}
              className="bg-purple-700 px-4 py-2 rounded-r hover:bg-purple-600"
            >
              Post
            </button>
          </div>

          {/* Display Comments */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded">
                  <p className="text-sm">{comment.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {comment.timestamp.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
