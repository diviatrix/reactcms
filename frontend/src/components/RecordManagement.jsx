import RecordForm from './RecordForm';
import RecordItem from './RecordItem';
import DesignBlock from './DesignBlock';

const RecordManagement = ({
  user,
  posts,
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
  setError,
}) => {
  return (
    <div className={`w-full ${user.role === 'admin' ? 'lg:w-1/2' : 'lg:w-full'}`}>
      <h2 className="text-2xl font-bold mb-4">Manage Records</h2>
      {user.role === 'admin' && (
        <DesignBlock user={user} token={user.token} setError={setError} />
      )}
      {(user.role === 'admin' || user.role === 'content_manager') && (
        <RecordForm
          editingPost={editingPost}
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          handleSubmit={editingPost ? handleSaveEdit : handleCreatePost}
          setEditingPost={setEditingPost}
        />
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Records</h3>
        {posts.length === 0 ? (
          <p>No records yet.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map(post => (
              <RecordItem
                key={post.id}
                post={post}
                user={user}
                handleEditPost={handleEditPost}
                handleUnpublishPost={handleUnpublishPost}
                handlePublishPost={handlePublishPost}
                handleDeletePost={handleDeletePost}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecordManagement;