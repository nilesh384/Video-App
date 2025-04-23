import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Profile() {
  const { userId } = useParams();  // Get user ID from URL
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`http://localhost:8000/api/v1/users/register/user/${userId}`);
      const result = await response.json();
      setUser(result.data);
    }
    fetchUser();
  }, [userId]);

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Welcome, {user.fullname}!</h1>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>
      <img src={user.avatar} alt="User Avatar" width="150" />
      {user.coverphoto && <img src={user.coverphoto} alt="Cover Photo" width="300" />}
    </div>
  );
}

export default Profile;
