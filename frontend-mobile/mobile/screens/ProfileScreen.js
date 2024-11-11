import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import axios from 'axios';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user', {
        withCredentials: true,
      });
      setUserData(response.data.user);
      fetchUserPosts();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user-posts', {
        withCredentials: true,
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("content", "");

      try {
        const response = await axios.post(
          "http://localhost:3000/api/upload",
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setPosts(prevPosts => [response.data.post, ...prevPosts]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {userData?.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.noImage]}>
              <Text>No Image</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.bioText}>{userData?.bio || 'No bio available'}</Text>
        
        {Platform.OS === 'web' && (
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
          />
        )}
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => document.getElementById('file-upload').click()}
        >
          <Text style={styles.uploadButtonText}>Upload Media</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.postsGrid}>
        {posts.map((post) => (
          <TouchableOpacity 
            key={post.post_id} 
            style={styles.postItem}
            onPress={() => {
              setSelectedPost(post);
              setModalVisible(true);
            }}
          >
            <Image
              source={{ uri: post.url }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {modalVisible && selectedPost && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedPost.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImageContainer: {
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioText: {
    fontSize: 16,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
  },
});

export default Profile;