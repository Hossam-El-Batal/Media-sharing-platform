import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Profile.css";
import uploadimage from "../assets/icons8-plus-50.png";
import Masonry from "react-masonry-css";
import Modal from "./Modal";

const Profile = () => {
  const [image, setImage] = useState(null); 
  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // see logged requests 
  useEffect(() => {
    axios.interceptors.request.use(request => {
      console.log('Request:', request);
      return request;
    });

    axios.interceptors.response.use(
      response => {
        console.log('Response:', response);
        return response;
      },
      error => {
        console.log('Error:', error.response);
        return Promise.reject(error);
      }
    );
  }, []);
  //////

  useEffect(() => {
    // First fetch user data
    fetchUserData();
  }, []);


  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/user",{
        withCredentials: true 
      }); 
      setUserData(response.data.user);
      setImage(response.data.profileImage);
      setBio(response.data.userBio);
      
      // After getting user data, fetch their posts
      fetchUserPosts();
    } catch (err) {
      setError('Error fetching user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts for the authenticated user
  const fetchUserPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user-posts',{
        withCredentials: true 
      }); 
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Error fetching posts');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("content", "");  // might add content - need to be fixed with a modal

      try {
        const response = await axios.post("http://localhost:3000/api/upload", formData,{
          withCredentials: true, 
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { post, url } = response.data;
        setPosts(prevPosts => [{
          post_id: post.post_id,
          user_id: post.user_id,
          content: post.content,
          type: post.type,
          url: post.url,
          created_at: post.created_at
        }, ...prevPosts]);
      } catch (error) {
        console.error("Error uploading file:", error);
        setError('Error uploading file');
      }
    }
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="container">
      <div className="profile-sub-1">
        <div className="profile-1">
          <div className="profile-pic">
            <div className={`profile-pic-inner ${!image ? 'greyed-out' : ''}`}>
              {image ? (
                <img src={image} alt="Profile" className="profile-img" />
              ) : (
                <span>No image selected</span>
              )}
            </div>
          </div>
          <div className="bio">
            <p>{bio}</p>
          </div>
        </div>
        <div className="profile-2">
          <div className="upload-btn" onClick={handleIconClick}>
            <img src={uploadimage} alt="Upload Icon" className="upload-icon" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="upload-input"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="posts">
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
          {posts.map((post, index) => (
            <div key={index} className="masonry-item" onClick={() => handlePostClick(post)}>
              {post.type === "photo" ? (
                <img src={post.url} alt={`Post ${index}`} className="post-media" />
              ) : (
                <video controls className="post-media">
                  <source src={post.url} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </Masonry>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
      />
    </div>
  );
};

export default Profile;
