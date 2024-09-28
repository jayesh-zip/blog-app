import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaCheck } from 'react-icons/fa';
import { UserContext } from '../context/userContext';
import axios from 'axios';

function UserProfile() {
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isAvatarTouched, setIsAvatarTouched] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email, avatar } = response.data;
        setName(name);
        setEmail(email);
        setAvatar(avatar);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    getUser();
  }, [currentUser.id, token]);

  // Handle image upload to the backend instead of directly to Cloudinary
  const uploadImageToBackend = async (imageFile) => {
    setUploading(true); // Indicate that the upload process has started

    const formData = new FormData();
    formData.append('avatar', imageFile); // 'avatar' matches the backend route name

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/change-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      setAvatar(response.data.avatar); // Use the updated avatar from the backend response
    } catch (error) {
      console.error('Error uploading image to backend:', error);
    } finally {
      setUploading(false); // End of upload process
    }
  };

  const changeAvatarHandler = (e) => {
    const imageFile = e.target.files[0]; // Get the selected image file
    if (imageFile) {
      setIsAvatarTouched(true);
      uploadImageToBackend(imageFile);
    }
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        name,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
      };

      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/users/edit-user`, userData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        navigate('/logout');
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <section className="profile">
      <div className="container profile_container">
        <Link to={`/myposts/${currentUser.id}`} className="btn">My Posts</Link>
        <div className="profile_details">
          <div className="avatar_wrapper">
            <div className="profile_avatar">
              <img 
                src={avatar || 'https://via.placeholder.com/150'} 
                alt="User Avatar" 
              />
            </div>

            {/* Form to update avatar */}
            <form className="avatar_form">
              <input
                type="file"
                name="avatar"
                id="avatar"
                onChange={changeAvatarHandler} // Handle image upload to backend
                accept="image/png, image/jpg, image/jpeg"
              />
              <label htmlFor="avatar"><FaEdit /></label>
            </form>

            {uploading && <p>Uploading...</p>} {/* Show upload progress */}
            {isAvatarTouched && !uploading && <button className="profile_avatar-btn"><FaCheck /></button>}
          </div>

          <h1>{currentUser.name}</h1>

          <form className="form profile_form" onSubmit={updateUserDetails}>
            {error && <p className="form_error-message">{error}</p>}
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Confirm New password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
            <button type="submit" className="btn primary">Update details</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default UserProfile;
