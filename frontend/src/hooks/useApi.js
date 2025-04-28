import { useCallback } from 'react';
import userconfig from '../../../config/user/config';
import config from '../../../config/config';

// Merge API_BASE_URL from userconfig if available
if (userconfig && userconfig.API_BASE_URL) {
  config.API_BASE_URL = userconfig.API_BASE_URL;
}
const API_BASE_URL = config.API_BASE_URL;

const useApi = (user, setPosts, setUsers, setDesignSettings, setError) => {
  // Fetch posts from API
  const fetchPosts = useCallback(() => {
    fetch(API_BASE_URL + 'posts', {
      headers: { token: user?.token },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
          setError('Unexpected response format while fetching posts');
        }
      })
      .catch(err => {
        console.error('Error fetching posts: ' + API_BASE_URL + 'posts', err);
        setError('Error fetching posts: ' + err.message);
        setPosts([]);
      });
  }, [user, setPosts, setError]);

  // Fetch design settings
  const fetchDesignSettings = useCallback(() => {
    fetch(API_BASE_URL + 'design', {
      headers: { token: user?.token },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch design settings');
        }
        return res.json();
      })
      .then(data => setDesignSettings(data))
      .catch(err => {
        console.error('Error fetching design settings: ' + API_BASE_URL + 'design', err);
        setError('Error fetching design settings: ' + err.message);
      });
  }, [user, setDesignSettings, setError]);

  // Fetch users (for admin)
  const fetchUsers = useCallback(() => {
    fetch(API_BASE_URL + 'users', {
      headers: { token: user.token },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          setError('Unexpected response format while fetching users');
        }
      })
      .catch(err => {
        console.error('Error fetching users: ' + API_BASE_URL + 'users', err);
        setError('Error fetching users: ' + err.message);
        setUsers([]);
      });
  }, [user, setUsers, setError]);

  // Handle post creation
  const handleCreatePost = async (e, title, content, setTitle, setContent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(API_BASE_URL + 'posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
        body: JSON.stringify({ title, content }),
      });
      const newPost = await res.json();
      if (!res.ok) {
        throw new Error(newPost.error || 'Failed to create post');
      }
      setPosts(prev => [...prev, newPost]);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error creating post: ' + API_BASE_URL + 'posts', err);
      setError('Error creating post: ' + err.message);
    }
  };

  // Handle post editing
  const handleSaveEdit = async (e, editingPost, title, content, setEditingPost, setTitle, setContent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
        body: JSON.stringify({ title, content, published: editingPost.published }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update post');
      }
      setPosts(prev => prev.map(p => (p.id === editingPost.id ? { ...p, title, content, published: editingPost.published } : p)));
      setEditingPost(null);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error updating post: ' + API_BASE_URL + 'posts/' + editingPost.id, err);
      setError('Error updating post: ' + err.message);
    }
  };

  // Handle unpublish post
  const handleUnpublishPost = async (postId) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}posts/${postId}/unpublish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unpublish post');
      }
      fetchPosts(); // Refresh the posts list
    } catch (err) {
      console.error('Error unpublishing post: ' + API_BASE_URL + 'posts/' + postId, err);
      setError('Error unpublishing post: ' + err.message);
    }
  };

  // Handle publish post
  const handlePublishPost = async (postId) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}posts/${postId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish post');
      }
      fetchPosts(); // Refresh the posts list
    } catch (err) {
      console.error('Error publishing post: ' + API_BASE_URL + 'posts/' + postId, err);
      setError('Error publishing post: ' + err.message);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }
      fetchPosts(); // Refresh the posts list
    } catch (err) {
      console.error('Error deleting post: ' + API_BASE_URL + 'posts/' + postId, err);
      setError('Error deleting post: ' + err.message);
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Error updating role: ' + API_BASE_URL + 'users/' + userId, err);
      setError('Error updating role: ' + err.message);
    }
  };

  return {
    fetchPosts,
    fetchDesignSettings,
    fetchUsers,
    handleCreatePost,
    handleSaveEdit,
    handleUnpublishPost,
    handlePublishPost,
    handleDeletePost,
    handleRoleUpdate,
  };
};

export default useApi;