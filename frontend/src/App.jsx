import { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import UserManagement from './components/UserManagement';
import RecordManagement from './components/RecordManagement';
import FrontPage from './components/FrontPage';
import config from '../../config';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [designSettings, setDesignSettings] = useState(null);
  const API_BASE_URL = config.API_BASE_URL;


  // Fetch posts from API
  const fetchPosts = () => {
    fetch(API_BASE_URL + 'posts', {
      headers: { token: user.token },
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
  };

  // Fetch design settings
  const fetchDesignSettings = () => {
    fetch(API_BASE_URL + 'design', {
      headers: { token: user.token },
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
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchDesignSettings();
    }
  }, [user]);

  // Fetch users for admin (if user is admin)
  useEffect(() => {
    if (user && user.role === 'admin') {
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
    }
  }, [user]);

  // Handle login
  const handleLogin = (data) => {
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  };

  // Handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setPosts([]);
    setUsers([]);
    setError('');
    setEditingPost(null);
    setDesignSettings(null);
  };

  // Handle post creation
  const handleCreatePost = async (e) => {
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
      setPosts([...posts, newPost]);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error creating post: ' + API_BASE_URL + 'posts', err);
      setError('Error creating post: ' + err.message);
    }
  };

  // Handle post editing
  const handleEditPost = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleSaveEdit = async (e) => {
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
      setPosts(posts.map(p => (p.id === editingPost.id ? { ...p, title, content, published: editingPost.published } : p)));
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
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Error updating role: ' + API_BASE_URL + 'users/' + userId, err);
      setError('Error updating role: ' + err.message);
    }
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} error={error} setError={setError} />;
  }

  // Render front page for viewers, CMS for admins/content managers
  if (user.role === 'viewer') {
    return (
      <FrontPage
        user={user}
        posts={posts}
        designSettings={designSettings}
        logout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <nav className="flex space-x-4">
          <div><img src="/1337.png" alt="Logo" width={64}/></div>
          <h1 className="text-xl font-bold text-gray-600">React CMS</h1>
        </nav>
        <div className="flex justify-between space-x-4"> {/* Updated from align-right to justify-between */}
            <span className="text-sm">Role: {user.role}</span>
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
      </div>
      
      <div className="p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col lg:flex-row gap-4">
          {user.role === 'admin' && (
            <UserManagement
              users={users}
              user={user}
              handleRoleUpdate={handleRoleUpdate}
            />
          )}
          <RecordManagement
            user={user}
            posts={posts}
            editingPost={editingPost}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            setEditingPost={setEditingPost}
            handleCreatePost={handleCreatePost}
            handleSaveEdit={handleSaveEdit}
            handleEditPost={handleEditPost}
            handleUnpublishPost={handleUnpublishPost}
            handlePublishPost={handlePublishPost}
            handleDeletePost={handleDeletePost}
            setError={setError}
          />
        </div>
      </div>
    </div>
  );
}

export default App;