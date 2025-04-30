import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserManagement from './UserManagement';
import RecordManagement from './RecordManagement';
import DesignBlock from './DesignBlock';

const AdminPanel = ({
  user,
  posts,
  users,
  error,
  setError,
  editingPost,
  title,
  setTitle,
  content,
  setContent,
  setEditingPost,
  handleCreatePost,
  handleSaveEdit,
  handleEditPost,
  handleUnpublishPost,
  handlePublishPost,
  handleDeletePost,
  handleRoleUpdate,
  logout,
}) => {
  const [activeTab, setActiveTab] = useState('records');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <nav className="flex space-x-4">
          <div><img src="/1337.png" alt="Logo" width={64}/></div>
          <h1 className="text-xl font-bold text-gray-600">React CMS</h1>
        </nav>
        <div className="flex justify-between space-x-4">
          <Link
            to="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Front Page
          </Link>
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
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            {(user.role === 'admin' || user.role === 'content_manager') && (
              <button
                onClick={() => setActiveTab('records')}
                className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'records'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manage Records
              </button>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                User Management
              </button>
            )}
            {(user.role === 'admin' || user.role === 'content_manager') && (
              <button
                onClick={() => setActiveTab('design')}
                className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'design'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Design Front Page
              </button>
            )}
          </div>
        </div>
        <div>
          {activeTab === 'records' && (user.role === 'admin' || user.role === 'content_manager') && (
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
          )}
          {activeTab === 'users' && user.role === 'admin' && (
            <UserManagement
              users={users}
              user={user}
              handleRoleUpdate={handleRoleUpdate}
            />
          )}
          {activeTab === 'design' && (user.role === 'admin' || user.role === 'content_manager') && (
            <DesignBlock user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;