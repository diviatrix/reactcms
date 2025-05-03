import { useCallback } from 'react';
import config from '../config/config.json'; // Import API_BASE_URL

// Use config directly since there’s no userconfig merging needed here
const API_BASE_URL = config.API_BASE_URL;
const ORIGIN = config.ORIGIN; // Default to localhost if not set
const UPLOAD_DIR = config.UPLOAD_DIR || 'public/'; // Default to public/ if not set

const useApi = (user, setPosts, setUsers, setDesignSettings, setError) => {
  
  // Fetch posts from API
  const fetchPosts = useCallback(async () => { // Added async
    setError(''); // Clear previous errors
    try {
      const res = await fetch(API_BASE_URL + 'posts', {
        headers: { token: user?.token },
      });
      if (!res.ok) {
        // Try to parse error message from response body if available
        let errorMsg = 'Failed to fetch posts';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
          // Ignore if response body is not JSON or empty
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
        setError('Unexpected response format while fetching posts');
      }
    } catch (err) {
      console.error('Error fetching posts: ' + API_BASE_URL + 'posts', err);
      setError('Error fetching posts: ' + err.message);
      setPosts([]); // Ensure posts are cleared on error
    }
  }, [user, setPosts, setError]);


  // Fetch design settings
  const fetchDesignSettings = useCallback(async () => { // Added async
    setError(''); // Clear previous errors
    try {
      const res = await fetch(API_BASE_URL + 'design', {
        headers: { token: user?.token },
      });
      if (!res.ok) {
        let errorMsg = 'Failed to fetch design settings';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
          // Ignore
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setDesignSettings(data);
    } catch (err) {
      console.error('Error fetching design settings: ' + API_BASE_URL + 'design', err);
      setError('Error fetching design settings: ' + err.message);
    }
  }, [user, setDesignSettings, setError]);


  // Fetch public uploads 
  const fetchPublicUploads = useCallback(async () => { // Added async
    setError(''); // Clear previous errors
    try {
      const res = await fetch(ORIGIN + `/public`, {
        headers: { token: user?.token },
      });
      if (!res.ok) {
        let errorMsg = 'Failed to fetch public uploads';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (parseError) {

        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching public uploads: ' + API_BASE_URL + 'uploads', err);
      setError('Error fetching public uploads: ' + err.message);
    }
  }, [user, setPosts, setError]);

  // Fetch users (for admin)
  const fetchUsers = useCallback(async () => { // Added async and corrected structure
    setError(''); // Clear previous errors
    if (!user?.token) { // Added check for user token
        setError('Authentication token is missing.');
        setUsers([]);
        return;
    }
    try {
      const res = await fetch(API_BASE_URL + 'users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
      });

      if (!res.ok) {
        let errorMsg = 'Failed to fetch users';
        try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
            // Ignore
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        setError('Unexpected response format while fetching users');
      }
    } catch (err) {
      console.error('Error fetching users: ' + API_BASE_URL + 'users', err);
      setError('Error fetching users: ' + err.message);
      setUsers([]); // Ensure users are cleared on error
    }
  }, [user, setUsers, setError]);


  // Handle post creation
  const handleCreatePost = useCallback(async (e, title, content, setTitle, setContent) => { // Added useCallback
    e.preventDefault();
    setError('');

    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!title || !title.trim() || !content || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const res = await fetch(API_BASE_URL + 'posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
        body: JSON.stringify({ title, content }),
      });
      const newPost = await res.json(); // Always parse JSON first
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
  }, [user, setPosts, setError]); // Added dependencies


  // Handle post editing
  const handleSaveEdit = useCallback(async (e, editingPost, title, content, setEditingPost, setTitle, setContent) => { // Added useCallback
    e.preventDefault();
    setError('');

    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!title || !title.trim() || !content || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    if (!editingPost?.id) {
        setError('Invalid post selected for editing.');
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
        body: JSON.stringify({ title, content, published: editingPost.published }),
      });
      const data = await res.json(); // Always parse JSON first
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update post');
      }
      // Use the returned data for update if available, otherwise use local state
      const updatedPost = data.post || { ...editingPost, title, content };
      setPosts(prev => prev.map(p => (p.id === updatedPost.id ? updatedPost : p)));
      setEditingPost(null);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error updating post: ' + API_BASE_URL + 'posts/' + editingPost.id, err);
      setError('Error updating post: ' + err.message);
    }
  }, [user, setPosts, setError]); // Added dependencies


  // Handle unpublish post
  const handleUnpublishPost = useCallback(async (postId) => { // Added useCallback
    setError('');
    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!postId) {
        setError('Invalid post ID for unpublishing.');
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}posts/${postId}/unpublish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', // Content-Type might not be needed for PUT without body, but often expected
          token: user.token,
        },
      });
      const data = await res.json(); // Always parse JSON first
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unpublish post');
      }
      // Update local state directly instead of refetching for better UX
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, published: false } : p)));
      // fetchPosts(); // Optionally refetch if server state might have changed more
    } catch (err) {
      console.error('Error unpublishing post: ' + API_BASE_URL + 'posts/' + postId, err);
      setError('Error unpublishing post: ' + err.message);
    }
  }, [user, setPosts, setError]); // Added dependencies


  // Handle publish post
  const handlePublishPost = useCallback(async (postId) => { // Added useCallback
    setError('');
    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!postId) {
        setError('Invalid post ID for publishing.');
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}posts/${postId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', // See note above
          token: user.token,
        },
      });
      const data = await res.json(); // Always parse JSON first
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish post');
      }
      // Update local state directly
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, published: true } : p)));
      // fetchPosts(); // Optionally refetch
    } catch (err) {
      console.error('Error publishing post: ' + API_BASE_URL + 'posts/' + postId, err);
      setError('Error publishing post: ' + err.message);
    }
  }, [user, setPosts, setError]); // Added dependencies


  // Handle delete post
  const handleDeletePost = useCallback(async (postId) => { // Added useCallback
    setError('');
    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!postId) {
        setError('Invalid post ID for deletion.');
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}posts/${postId}`, {
        method: 'DELETE',
        headers: {
          // 'Content-Type': 'application/json', // Not needed for DELETE with no body
          token: user.token,
        },
      });
      // Check status for success, DELETE might return 204 No Content
      if (res.status === 204) {
          setPosts(prev => prev.filter(p => p.id !== postId)); // Update local state
          return; // Success
      }
      const data = await res.json(); // Parse JSON if status is not 204
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }
      // If API returns deleted post or confirmation, handle it here if needed
      setPosts(prev => prev.filter(p => p.id !== postId)); // Update local state
      // fetchPosts(); // Optionally refetch
    } catch (err) {
      console.error('Error deleting post: ' + API_BASE_URL + 'posts/' + postId, err);
      setError('Error deleting post: ' + err.message);
    }
  }, [user, setPosts, setError]); // Added dependencies


  // Handle user update (for admin)
  const handleUserUpdate = useCallback(async (userId, field, value) => { // Added useCallback
    setError('');
    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!userId || !field) {
        setError('Invalid parameters for user update.');
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: user.token,
        },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json(); // Always parse JSON first
      if (!res.ok) {
        throw new Error(data.error || `Failed to update user ${field}`);
      }
      // Use returned user data if available for update
      const updatedUser = data.user || { id: userId, [field]: value };
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updatedUser } : u)));
    } catch (err) {
      console.error(`Error updating user ${field}: ${API_BASE_URL}users/${userId}`, err);
      setError(`Error updating user ${field}: ${err.message}`);
      // Optionally refetch users on error to sync state
      // fetchUsers();
    }
  }, [user, setUsers, setError]); // Added dependencies


  // Handle user delete (for admin)
  const handleUserDelete = useCallback(async (userId) => { // Added useCallback
    setError('');
    if (!user?.token) {
        setError('Authentication token is missing.');
        return;
    }
    if (!userId) {
        setError('Invalid user ID for deletion.');
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}users/${userId}`, {
        method: 'DELETE',
        headers: {
          // 'Content-Type': 'application/json', // Not needed for DELETE
          token: user.token,
        },
      });
      // Check status for success (e.g., 204 No Content)
       if (res.status === 204) {
          setUsers(prev => prev.filter(u => u.id !== userId)); // Update local state
          return; // Success
      }
      const data = await res.json(); // Parse JSON if status is not 204
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      setUsers(prev => prev.filter(u => u.id !== userId)); // Update local state
    } catch (err) {
      console.error('Error deleting user: ' + API_BASE_URL + 'users/' + userId, err);
      setError('Error deleting user: ' + err.message);
    }
  }, [user, setUsers, setError]); // Added dependencies


  return {
    fetchPosts,
    fetchDesignSettings,
    fetchUsers,
    handleCreatePost,
    handleSaveEdit,
    handleUnpublishPost,
    handlePublishPost,
    handleDeletePost,
    handleUserUpdate,
    handleUserDelete,
  };
};

export default useApi;