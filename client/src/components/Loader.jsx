import React from 'react';
import LoadingGif from '../images/Loading.gif';

export const Loader = () => {
  return (
    <div className="loader">
      <div className="loader_image">
        <img src={LoadingGif} alt="Loading..." />
      </div>
    </div>
  );
};
