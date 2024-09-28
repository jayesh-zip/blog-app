import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/userContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader } from '../components/Loader';

function DeletePost({ postId: id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } 
  }, [token, navigate]);

  const removePost = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`https://blog-app-dp8f.onrender.com/posts/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        if (location.pathname === `/myposts/${currentUser.id}`) {
          navigate(0);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Couldn't delete post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Link className="btn sm danger" onClick={removePost}>
      Delete
    </Link>
  );
}

export default DeletePost;
