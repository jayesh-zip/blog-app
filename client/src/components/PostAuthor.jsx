import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en.json'
import ru from 'javascript-time-ago/locale/ru.json'

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

function PostAuthor({authorID, createdAt}) {
  const [author, setAuthor] = useState({})
  
  useEffect(() => {
    const getAuthor = async () => {
      try {
        const response = await axios.get(`https://blog-app-dp8f.onrender.com/users/${authorID}`)
        setAuthor(response?.data)
      } catch (error) {
        console.error(error)
      }
    }
    getAuthor();
}, [])

  return (
    <Link to={`/posts/users/${authorID}`} className='post_author'>
        <div className="post_author-avatar">
            <img src={author.avatar  || 'https://via.placeholder.com/150'} alt={author.name || "Author's avatar"} />
        </div>
        <div className="post_author-details">
            <h5>By: {author.name}</h5>
            <small><ReactTimeAgo date={new Date(createdAt)} locale='en-US' /></small>
        </div>
    </Link>
  )
}

export default PostAuthor