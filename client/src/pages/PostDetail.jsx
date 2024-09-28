import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import DeletePost from './DeletePost';
import PostAuthor from '../components/PostAuthor';
import { Loader } from '../components/Loader';
import axios from 'axios';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://blog-app-dp8f.onrender.com/posts/${id}`);
        if (response.data) {
          setPost(response.data);
        } else {
          navigate('/not-found');
        }
      } catch (error) {
        setError('Error fetching the post.');
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };
    getPost();
  }, [id, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="post-detail">
      {error && <p className='error'>{error}</p>}
      {post && (
        <div className="container post-detail_container">
          <div className="container post-detail_header">
            <PostAuthor authorID={post.creator} createdAt={post.createdAt} />
            {currentUser?.id === post?.creator && (
              <div className="post-detail_button">
                <Link to={`/posts/${post?._id}/edit`} className='btn sm primary'>
                  Edit
                </Link>
                <DeletePost postId={id} />
              </div>
            )}
          </div>
          <h1>{post.title}</h1>
          <div className="post-detail_thumbnail">
            <img src={post.thumbnail} alt="Post Thumbnail" />
          </div>
          <p dangerouslySetInnerHTML={{ __html: post.description }}></p>
        </div>
      )}
    </section>
  );
}

export default PostDetail;
