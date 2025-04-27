const RecordForm = ({ editingPost, title, setTitle, content, setContent, handleSubmit, setEditingPost }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{editingPost ? 'Edit Record' : 'Create'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {editingPost && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editingPost.published}
                onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Published</label>
            </div>
          )}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingPost ? 'Save' : 'Create record'}
            </button>
            {editingPost && (
              <button
                type="button"
                onClick={() => {
                  setEditingPost(null);
                  setTitle('');
                  setContent('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };
  
  export default RecordForm;