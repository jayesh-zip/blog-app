import React, { useEffect, useState } from 'react';
import PostItem from './PostItem';
import axios from 'axios';
import { Loader } from '../components/Loader';

function Posts() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
                setPosts(response?.data);
            } catch (err) {
                console.error(err); // Optionally keep this for error logging
            }
            setIsLoading(false);
        };
        fetchPosts();
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <section>
            {posts.length > 0 ? (
                <div className="container posts_container">
                    {posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt }) => (
                        <PostItem key={id} postID={id} thumbnail={thumbnail} category={category} title={title} description={description} authorID={creator} createdAt={createdAt} />
                    ))}
                </div>
            ) : (
                <h2 className='center'>No posts founds</h2>
            )}
        </section>
    );
}

export default Posts;
