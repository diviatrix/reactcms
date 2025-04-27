const RecordItem = ({ post, user, handleEditPost, handleUnpublishPost, handlePublishPost, handleDeletePost }) => {
    return (
      <li key={post.id} className="p-4 border rounded">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold">{post.title}</h4>
            <p>{post.content}</p>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              Status: {post.published ? 'Published' : 'Unpublished'}
            </p>
          </div>
          {(user.role === 'admin' || user.role === 'content_manager') && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditPost(post)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              {post.published ? (
                <button
                  onClick={() => handleUnpublishPost(post.id)}
                  className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={() => handlePublishPost(post.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Publish
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </li>
    );
  };
  
  export default RecordItem;