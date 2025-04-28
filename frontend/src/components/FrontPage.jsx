import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const FrontPage = ({ user, posts, designSettings, logout }) => {
  const { header_text, primary_color, secondary_color } = designSettings || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: secondary_color || '#f3f4f6' }}>
      <nav className="p-4 flex justify-between items-center" style={{ backgroundColor: primary_color || '#2563eb' }}>
        <h1 className="text-xl font-bold text-white">{header_text || 'Welcome to Our Website'}</h1>
        <div className="flex space-x-4">
          {user && (user.role === 'admin' || user.role === 'content_manager') && (
            <Link
              to="/admin"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Admin Panel
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Latest Posts</h2>
        {!(posts && posts.length) ? (
          <p className="text-white">No published posts available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts
              .filter(post => post.published)
              .map(post => (
                <div key={post.id} className="p-4 rounded shadow-md bg-white">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-gray-600">{post.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FrontPage;