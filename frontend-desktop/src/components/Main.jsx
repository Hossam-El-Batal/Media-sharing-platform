import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import Modal from './Modal';
import { formatDistanceToNow } from 'date-fns';
import '../styles/Main.css';
import { Link } from 'react-router-dom';

const Main = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/check-auth', {
          withCredentials: true
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllPosts();
    }
  }, [isAuthenticated]);

  const fetchAllPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/posts', {
        withCredentials: true
      });
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="main-container">
      <div className="posts-grid">
        <div>
          <h1>Main page to show all posts</h1>
        </div>
        <Masonry
          breakpointCols={{
            default: 4,
            1100: 3,
            700: 2,
            500: 1
          }}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {posts.map((post) => (
            <div key={post.post_id} className="masonry-item" onClick={() => handlePostClick(post)}>
              <div className="post-content">
                {post.type === "photo" ? (
                  <img src={post.url} alt={`Post by ${post.username}`} className="post-media" />
                ) : (
                  <video controls className="post-media">
                    <source src={post.url} type="video/mp4" />
                  </video>
                )}
                <div className="post-info">
                  <span className="username">{post.username}</span>
                  <span className="post-date">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
      />
      <Link to="/profile" className="profile-link">Go to Profile</Link>
    </div>
  );
};

export default Main;