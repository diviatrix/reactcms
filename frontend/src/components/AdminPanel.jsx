import { Link } from 'react-router-dom';
import UserManagement from './UserManagement';
import RecordManagement from './RecordManagement';

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
};

export default AdminPanel;