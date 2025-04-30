const RecordForm = ({ editingPost, title, setTitle, content, setContent, handleSubmit, setEditingPost }) => {
  const onSubmit = (e) => {
    if (editingPost) {
      // If editing, pass all arguments for handleSaveEdit
      handleSubmit(e, editingPost, title, content, setEditingPost, setTitle, setContent);
    } else {
      // If creating, pass arguments for handleCreatePost
      handleSubmit(e, title, content, setTitle, setContent);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          rows="4"
          required
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingPost ? 'Update' : 'Create'} Post
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
  );
};

export default RecordForm;