import React, { useEffect, useState } from 'react'
import PostItem from '../components/PostItem';  
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {Loader} from '../components/Loader'

function CategoryPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const {category} = useParams()

  useEffect(() => {
    const fatchPost = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/categories/${category}`)        
        setPosts(response.data)
      } catch (err) {
        console.error(err)
      }
      setIsLoading(false)
    }
    fatchPost()
  }, [category])

  if(isLoading) {
    return <Loader />
  }

  return (
    <section className="posts">
        {posts.length > 0 ? <div className="container posts_container">
            {
                posts.map(({_id: id, thumbnail, category, title, description, creator, createdAt}) => <PostItem key={id} postID={id} thumbnail={thumbnail} category={category} title={title} description={description} authorID={creator} createdAt={createdAt} />)
            }
        </div> : <h2 className='center'>No posts founds</h2>}
    </section>
  )
}

export default CategoryPosts