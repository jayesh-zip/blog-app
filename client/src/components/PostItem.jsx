import React from 'react';
import { Link } from 'react-router-dom';
import PostAuthor from './PostAuthor';

function PostItem({ postID, category, title, description, authorID, thumbnail, createdAt }) {
  const shortDescription = description.length > 130 ? `${description.substr(0, 145)}...` : description;
  const shortTitle = title.length > 27 ? `${title.substr(0, 30)}...` : title;

  return (
    <article className="post">
      <div className="post_thumbnail">
        <img src={thumbnail} alt={title} />
      </div>
      <div className="post_content">
        <Link to={`/posts/${postID}`}>
          <h3>{shortTitle}</h3>
        </Link>
        <p dangerouslySetInnerHTML={{ __html: shortDescription }} />
        <div className="post_footer">
          <PostAuthor authorID={authorID} createdAt={createdAt} />
          <Link to={`/posts/categories/${category}`} className="btn category">
            {category}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PostItem;
