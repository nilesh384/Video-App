import { useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import "./App.css";

function App() {
  const navigate = useNavigate();  // Create navigate function

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    password: "",
    avatar: null,
    coverphoto: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [e.target.name]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("fullname", formData.fullname);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("avatar", formData.avatar);
    if (formData.coverphoto) {
      formDataToSend.append("coverphoto", formData.coverphoto);
    }

    const response = await fetch("http://localhost:8000/api/v1/users/register", {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();
    console.log(result);

    if (response.ok) {
      navigate(`/profile/${result.data._id}`);  // Redirect to profile page
    }
  };

  return (
    <div>
      <h1>Register User</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="fullname" placeholder="Full Name" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="file" name="avatar" onChange={handleFileChange} required />
        <input type="file" name="coverphoto" onChange={handleFileChange} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default App;
