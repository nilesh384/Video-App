import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditDetails = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState(localStorage.getItem("fullname") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const token = localStorage.getItem("token");

  const updateDetails = async () => {
    try {
      const res = await fetch("https://video-app-1l96.onrender.com/api/v1/users/update-account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullname, email }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("fullname", data.data.fullname);
        localStorage.setItem("email", data.data.email);
        setMsg("Account details updated.");
        setTimeout(() => setMsg(""), 1500);
        setError("");
      } else throw new Error(data.message);
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  const changePassword = async () => {
    try {
      const res = await fetch("https://video-app-1l96.onrender.com/api/v1/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Password changed.");
        setError("");
        setPasswords({ oldPassword: "", newPassword: "" });
      } else throw new Error(data.message);
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  const uploadImage = async (file, type) => {
    if (!file) {
      setError(`No ${type} selected.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const endpoint = type === "avatar" ? "update-avatar" : "update-cover";
    const setLoading = type === "avatar" ? setAvatarLoading : setCoverLoading;

    setLoading(true);
    try {
      const res = await fetch(`https://video-app-1l96.onrender.com/api/v1/users/${endpoint}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (type === "avatar") localStorage.setItem("avatar", data.data.avatar);
        else localStorage.setItem("coverphoto", data.data.coverphoto);

        setMsg(`${type} updated.`);
        setError("");
        setTimeout(() => {
          setMsg("");
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      setMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto bg-[#1e293b] p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6">Edit Channel</h2>

        {msg && <p className="text-green-400 mb-4">{msg}</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <div className="mb-4">
          <label>Full Name</label>
          <input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded mt-1"
          />
        </div>

        <div className="mb-4">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded mt-1"
          />
        </div>

        <button
          onClick={updateDetails}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-6 hover:cursor-pointer"
        >
          Update Details
        </button>

        <hr className="my-6 border-gray-600" />

        <div className="mb-4">
          <label className="block mb-1 text-sm">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-600 hover:file:cursor-pointer"
          />
          {avatarFile && (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="Avatar Preview"
              className="w-auto h-32 mt-2 rounded"
            />
          )}
          {avatarFile && (
            <button
              onClick={() => uploadImage(avatarFile, "avatar")}
              disabled={avatarLoading}
              className={`mt-3 px-4 py-2 rounded hover:cursor-pointer ${
                avatarLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {avatarLoading ? "Uploading..." : "Upload Avatar"}
            </button>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm">Cover Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-600 hover:file:cursor-pointer"
          />
          {coverFile && (
            <img
              src={URL.createObjectURL(coverFile)}
              alt="Cover Preview"
              className="w-auto h-32 mt-2 rounded"
            />
          )}
          {coverFile && (
            <button
              onClick={() => uploadImage(coverFile, "cover")}
              disabled={coverLoading}
              className={`mt-3 px-4 py-2 rounded hover:cursor-pointer ${
                coverLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {coverLoading ? "Uploading..." : "Upload Cover Photo"}
            </button>
          )}
        </div>

        <hr className="my-6 border-gray-600" />

        <div className="mb-4">
          <label>Old Password</label>
          <input
            type="password"
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, oldPassword: e.target.value })
            }
            className="w-full bg-gray-700 px-4 py-2 rounded mt-1"
          />
        </div>

        <div className="mb-4">
          <label>New Password</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
            className="w-full bg-gray-700 px-4 py-2 rounded mt-1"
          />
        </div>

        <button
          onClick={changePassword}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded hover:cursor-pointer"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default EditDetails;
