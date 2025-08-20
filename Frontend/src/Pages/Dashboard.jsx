import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";

const ChannelDashboard = () => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const fetchChannelStats = async () => {
      const token = localStorage.getItem("token");

      // Guest dashboard fallback
      if (!token) {
        setChannel({
          avatar: "https://via.placeholder.com/150?text=Avatar",
          coverPhoto: "https://via.placeholder.com/1200x300?text=Cover+Photo",
          name: "Welcome to My Tube",
          username: "@guest",
          bio: "You are browsing as a guest. Sign in to personalize your channel, upload videos, and track your stats.",
          stats: {
            videos: 0,
            subscribers: 0,
            views: 0,
            likes: 0,
            joined: "Not a member",
          },
        });
        setUser(null);
        setLoading(false);
        return;
      }

      // Logged-in user fetch
      try {
        const res = await fetch(
          "https://video-app-1l96.onrender.com/api/v1/dashboard/channel-stats",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Fetch failed");

        const stats = result.data;
        setUser(stats);

        // Safely compute joined date
        const rawJoined = stats.createdAt || localStorage.getItem("createdAt");
        const joined = rawJoined
          ? new Date(rawJoined).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Unknown";

        setChannel({
          avatar: stats.avatar || localStorage.getItem("avatar") || "https://via.placeholder.com/150?text=Avatar",
          coverPhoto: stats.coverphoto || localStorage.getItem("coverphoto") || "https://via.placeholder.com/1200x300?text=Cover+Photo",
          name: stats.fullname || localStorage.getItem("fullname") || "My Channel",
          username: "@" + (stats.username || localStorage.getItem("username") || "user"),
          bio: stats.bio || "Creator on My Tube",
          stats: {
            videos: stats.totalVideos || 0,
            subscribers: stats.totalSubscribers || 0,
            views: stats.totalViews || 0,
            likes: stats.totalLikes || 0,
            joined,
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
        // Fallback to guest
        setChannel({
          avatar: "https://via.placeholder.com/150?text=Avatar",
          coverPhoto: "https://via.placeholder.com/1200x300?text=Cover+Photo",
          name: "Welcome to My Tube",
          username: "@guest",
          bio: "You are browsing as a guest. Sign in to personalize your channel.",
          stats: {
            videos: 0,
            subscribers: 0,
            views: 0,
            likes: 0,
            joined: "Not a member",
          },
        });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelStats();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Cover Photo */}
      <div
        className="h-64 w-full bg-cover bg-center bg-gray-400"
        style={{ backgroundImage: `url(${channel.coverPhoto})` }}
      ></div>

      {/* Channel Info Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex items-center space-x-6">
          <img
            src={channel.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-[#1e293b] -mt-24 bg-[#1e293b]"
          />
          <div>
            <h2 className="text-2xl font-bold">{channel.name}</h2>
            <p className="text-gray-400">{channel.username}</p>
            <p className="mt-2 max-w-xl text-gray-300">{channel.bio}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-6 flex flex-wrap md:justify-start gap-8 justify-center text-center">
          <Stat label="Videos" value={channel.stats.videos} />
          <Stat
            label="Subscribers"
            value={channel.stats.subscribers.toLocaleString()}
          />
          <Stat label="Views" value={channel.stats.views.toLocaleString()} />
          <Stat label="Likes" value={channel.stats.likes.toLocaleString()} />
          <Stat label="Joined" value={channel.stats.joined} />
        </div>

        {/* Edit Button (only for logged-in users) */}
        {user && (
          <div className="mt-6">
            <Link to="/editchannel">
              <button
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-full hover:cursor-pointer"
            >
              Edit Channel
            </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-[#1e293b] pl-10 pr-10 pt-4 pb-4 rounded-xl shadow min-w-[120px]">
    <p className="text-xl font-bold">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

export default ChannelDashboard;
