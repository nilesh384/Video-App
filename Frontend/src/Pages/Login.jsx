import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "", // combined field for email or username
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.identifier) tempErrors.identifier = "Username or Email is required";
    if (!formData.password) tempErrors.password = "Password is required";
    return tempErrors;
  };

  const isEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

    const loginPayload = isEmail(formData.identifier)
      ? { email: formData.identifier, password: formData.password }
      : { username: formData.identifier, password: formData.password };

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        const text = await res.text();
        setErrors({ general: text || "Something went wrong. Please try again." });
        setIsLoading(false);
        return;
      }

      if (res.ok && data.success) {
        setSuccessMsg(data.message || "✅ Logged in successfully!");
        setErrors({});
        setFormData({ identifier: "", password: "" });
        setTimeout(() => navigate("/"), 1000);
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
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {errors.general && <p className="text-red-500 text-sm text-center mb-4">{errors.general}</p>}
        {successMsg && <p className="text-green-400 text-sm text-center mb-4">{successMsg}</p>}

        {/* Combined input for email/username */}
        <div className="mb-4">
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={formData.identifier}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-gray-700 border ${
              errors.identifier ? "border-red-500" : "border-gray-600"
            } rounded focus:outline-none`}
          />
          {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
        </div>

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
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
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
            "Login"
          )}
        </button>
      </motion.form>
    </div>
  );
};



export default Login;
