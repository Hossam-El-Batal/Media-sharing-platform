// creating a general use modal to display click photo/video and show like button and total likes

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import '../styles/Modal.css';

const Modal = ({ isOpen, onClose, post, onDelete }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      fetchLikes();
    }
  }, [isOpen, post]);

  const fetchLikes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/posts/${post.post_id}/likes`,
        { withCredentials: true }
      );
      setLikeCount(response.data.likeCount);
      setUserLiked(response.data.userLiked);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleLikeClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    // Optimistic update to mimic smoother UX
    const previousLikeCount = likeCount;
    const previousUserLiked = userLiked;
    
    setLikeCount(prev => userLiked ? prev - 1 : prev + 1);
    setUserLiked(prev => !prev);

    try {
      const response = await axios.post(
        `http://localhost:3000/api/posts/${post.post_id}/toggle-like`,
        {},
        { withCredentials: true }
      );
      
      // Update with actual server response ( the actual total of likes)
      setLikeCount(response.data.likeCount);
      setUserLiked(response.data.liked);
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error);
      setLikeCount(previousLikeCount);
      setUserLiked(previousUserLiked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/posts/${post.post_id}`, {
        withCredentials: true
      });
      onDelete(post.post_id);
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (!isOpen || !post) return null;

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="close-btn"
        >
          ✕
        </button>

        {/* Media content */}
        <div className="media-container">
          {post.type === "photo" ? (
            <img
              src={post.url}
              alt="Post content"
            />
          ) : (
            <video
              controls
            >
              <source src={post.url} type="video/mp4" />
            </video>
          )}
        </div>

        {/* Like section */}
        <div className="like-section">
          <button
            onClick={handleLikeClick}
            disabled={isLoading}
            className="like-btn"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${userLiked ? 'liked' : 'unliked'}`}
            />
            <span>{likeCount} likes</span>
          </button>

          {post.isProfile && (
            <button
              onClick={handleDeleteClick}
              className="remove-btn"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
