import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Mock login (replace with real auth later)
  const login = () => setUser({ username: 'admin' });
  const logout = () => setUser(null);

  // Fetch posts from API
  useEffect(() => {
    if (user) {
      fetch('http://localhost:3001/api/posts')
        .then(res => res.json())
        .then(data => setPosts(data))
        .catch(err => console.error('Error fetching posts:', err));
    }
  }, [user]);

  // Handle post creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const newPost = await res.json();
      setPosts([...posts, newPost]);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <button
            onClick={login}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login as Admin
          </button>
          <p className="mt-2 text-sm text-gray-600">
            (Mock login. Implement real auth later.)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">CMS Admin</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Records</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Create</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded h-32"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create record
            </button>
          </form>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Records</h3>
          {posts.length === 0 ? (
            <p>No records yet.</p>
          ) : (
            <ul className="space-y-2">
              {posts.map(post => (
                <li key={post.id} className="p-4 border rounded">
                  <h4 className="font-bold">{post.title}</h4>
                  <p>{post.content}</p>
                  <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;