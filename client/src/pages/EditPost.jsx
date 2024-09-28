import React, { useContext, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import axios from 'axios';
import { Loader } from '../components/Loader';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;

  const [post, setPost] = useState({
    title: '',
    category: 'Uncategorized',
    description: '',
    thumbnail: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const POST_CATEGORIES = [
    'Agriculture',
    'Business',
    'Education',
    'Entertainment',
    'Art',
    'Investment',
    'Uncategorized',
    'Weather',
  ];

  useEffect(() => {
    const getPost = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        setError("Error fetching the post. Please try again.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setPost((prevPost) => ({
      ...prevPost,
      description: value,
    }));
  };

  const handleThumbnailChange = (e) => {
    setPost((prevPost) => ({
      ...prevPost,
      thumbnail: e.target.files[0],
    }));
  };

  const editPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('id', id);

    if (post.title) formData.append('title', post.title);
    if (post.category) formData.append('category', post.category);
    if (post.description) formData.append('description', post.description);
    if (post.thumbnail) formData.append('thumbnail', post.thumbnail);

    try {
      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/posts/${id}`, formData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating the post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-post">
      <div className="container">
        <h2>Edit Post</h2>
        {error && <p className="form_error-message">{error}</p>}
        {loading && <Loader />}
        <form className="form create-post_form" onSubmit={editPost}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={post.title}
            onChange={handleInputChange}
            autoFocus
          />
          <select name="category" value={post.category} onChange={handleInputChange}>
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ReactQuill modules={{ toolbar: true }} value={post.description} onChange={handleDescriptionChange} />
          <input type="file" onChange={handleThumbnailChange} accept="image/png, image/jpeg, image/jpg" />
          <button type="submit" className="btn primary">
            Update
          </button>
        </form>
      </div>
    </section>
  );
}

export default EditPost;
