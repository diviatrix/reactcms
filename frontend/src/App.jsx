import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import FrontPage from './components/FrontPage';
import AdminPanel from './components/AdminPanel'; // Import the new AdminPanel component
import useApi from './components/hooks/useApi'; // Import the custom hook

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

  // Use the custom hook for API calls
  const {
    fetchPosts,
    fetchDesignSettings,
    fetchUsers,
    handleCreatePost,
    handleSaveEdit,
    handleUnpublishPost,
    handlePublishPost,
    handleDeletePost,
    handleRoleUpdate,
  } = useApi(user, setPosts, setUsers, setDesignSettings, setError);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchDesignSettings();
      if (user.role === 'admin') {
        fetchUsers();
      }
    }
  }, [user, fetchPosts, fetchDesignSettings, fetchUsers]);

  // Handle login
  const handleLogin = (data) => {
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    setError('');
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

  // Handle post editing (moved to AdminPanel, but keeping the state management here)
  const handleEditPost = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <FrontPage
              user={user}
              posts={posts}
              designSettings={designSettings}
              logout={logout}
            />
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'viewer' ? '/' : '/admin'} />
            ) : (
              <AuthForm onLogin={handleLogin} error={error} setError={setError} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user && (user.role === 'admin' || user.role === 'content_manager') ? (
              <AdminPanel
                user={user}
                posts={posts}
                users={users}
                error={error}
                setError={setError}
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
                handleRoleUpdate={handleRoleUpdate}
                logout={logout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;