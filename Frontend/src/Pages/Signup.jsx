import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../index.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    avatar: null,
    coverphoto: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.fullname) tempErrors.fullname = "Full name is required";
    if (!formData.username) tempErrors.username = "Username is required";
    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.password) tempErrors.password = "Password is required";
    if (!formData.avatar) tempErrors.avatar = "Avatar is required";
    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length !== 0) {
      setErrors(validationErrors);
      setSuccessMsg("");
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) form.append(key, val);
    });

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        body: form,
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        const text = await res.text();
        setErrors({
          general: text || "Something went wrong. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      if (res.ok && data.success) {
        setSuccessMsg(data.message || "✅ Registered successfully!");
        setFormData({
          fullname: "",
          username: "",
          email: "",
          password: "",
          avatar: null,
          coverphoto: null,
        });

        setTimeout(() => {
          navigate("/login"); // Adjust the path to match your route
        }, 1000); // optional delay to let the user see the success message

        setErrors({});
      } else {
        const newErrors = {};

        if (data.errors && typeof data.errors === "object") {
          for (let key in data.errors) {
            newErrors[key] = data.errors[key];
          }
        }

        if (Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            if (err.param) {
              newErrors[err.param] = err.msg;
            } else {
              newErrors.general = err.msg || data.message;
            }
          });
        }

        if (!Object.keys(newErrors).length && data.message) {
          newErrors.general = data.message;
        }

        setErrors(newErrors);
        setSuccessMsg("");
      }
    } catch (error) {
      console.error("Network/Unexpected error:", error);
      setErrors({ general: "Something went wrong. Please try again." });
      setSuccessMsg("");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {errors.general && (
          <p className="text-red-500 text-sm text-center mb-4">
            {errors.general}
          </p>
        )}
        {successMsg && (
          <p className="text-green-400 text-sm text-center mb-4">
            {successMsg}
          </p>
        )}

        {["fullname", "username", "email"].map((field) => (
          <div className="mb-4" key={field}>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              placeholder={
                field.charAt(0).toUpperCase() +
                field.slice(1).replace("name", " Name")
              }
              value={formData[field]}
              onChange={handleChange}
              aria-label={field}
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors[field] ? "border-red-500" : "border-gray-600"
              } rounded focus:outline-none`}
            />
            {errors[field] && (
              <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
            )}
          </div>
        ))}

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            aria-label="password"
            className={`w-full px-4 py-2 bg-gray-700 border ${
              errors.password ? "border-red-500" : "border-gray-600"
            } rounded focus:outline-none pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white hover:cursor-pointer"
            aria-label="Toggle Password Visibility"
          >
            {showPassword ? 
              <i class="fa-solid fa-eye"></i> :
              <i class="fa-solid fa-eye-slash"></i>
            }
          </button>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">
            Avatar <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-600 hover:file:cursor-pointer"
          />
          { formData.avatar && <img
            src={
              formData.avatar
                ? URL.createObjectURL(formData.avatar)
                : formData.avatar
            }
            className="w-auto h-32 mt-2"
          />}
          {errors.avatar && (
            <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm">Cover Photo (optional)</label>
          <input
            type="file"
            name="coverphoto"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 hover:file:cursor-pointer"
          />
          { formData.coverphoto && <img
            src={
              formData.coverphoto
                ? URL.createObjectURL(formData.coverphoto)
                : formData.coverphoto
            }
            className="w-auto h-32 mt-2"
          />}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 hover:cursor-pointer transition-colors py-2 rounded font-semibold flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-[100ms]">•</span>
              <span className="animate-bounce delay-[200ms]">•</span>
            </span>
          ) : (
            "Sign Up"
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default Signup;
