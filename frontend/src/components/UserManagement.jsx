import { useState } from 'react';

// UserItem component representing a table row
const UserItem = ({ u, currentUser, handleUserUpdate, handleDeleteClick }) => {
  const [editingUsername, setEditingUsername] = useState(u.username);
  const [showConfirmUsername, setShowConfirmUsername] = useState(false);
  const [editingNickname, setEditingNickname] = useState(u.nickname);
  const [showConfirmNickname, setShowConfirmNickname] = useState(false);
  const [editingRole, setEditingRole] = useState(u.role); // State for temporary role selection
  const [showConfirmRole, setShowConfirmRole] = useState(false); // State for role confirm buttons
  const [editingPassword, setEditingPassword] = useState(''); // State for password input
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for password confirm buttons

  const handleUsernameChange = (e) => {
    setEditingUsername(e.target.value);
    setShowConfirmUsername(true);
  };

  const confirmUsernameUpdate = () => {
    handleUserUpdate(u.id, 'username', editingUsername);
    setShowConfirmUsername(false);
  };

  const cancelUsernameUpdate = () => {
    setEditingUsername(u.username);
    setShowConfirmUsername(false);
  }

  const handleNicknameChange = (e) => {
    setEditingNickname(e.target.value);
    setShowConfirmNickname(true);
  };

  const confirmNicknameUpdate = () => {
    handleUserUpdate(u.id, 'nickname', editingNickname);
    setShowConfirmNickname(false);
  };

   const cancelNicknameUpdate = () => {
    setEditingNickname(u.nickname);
    setShowConfirmNickname(false);
  }

  const handleRoleChange = (e) => {
    setEditingRole(e.target.value);
    setShowConfirmRole(true); // Show confirm buttons when role changes
  };

  const confirmRoleUpdate = () => {
    handleUserUpdate(u.id, 'role', editingRole);
    setShowConfirmRole(false); // Hide buttons after applying
  };

  const cancelRoleUpdate = () => {
    setEditingRole(u.role); // Reset to original role
    setShowConfirmRole(false); // Hide buttons
  };

  const handlePasswordChange = (e) => {
    setEditingPassword(e.target.value);
    setShowConfirmPassword(true); // Show confirm buttons when password changes
  };

  const confirmPasswordUpdate = () => {
    // Only update if password is not empty
    if (editingPassword.trim()) {
      handleUserUpdate(u.id, 'password', editingPassword);
    }
    setShowConfirmPassword(false); // Hide buttons after applying or if empty
    setEditingPassword(''); // Clear the input field
  };

  const cancelPasswordUpdate = () => {
    setEditingPassword(''); // Clear the input field
    setShowConfirmPassword(false); // Hide buttons
  };


  return (
    <tr key={u.id} className="border-b hover:bg-gray-50">
      <td className="py-2 px-4 text-sm text-gray-700">{u.id}</td>
      <td className="py-2 px-4 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editingUsername}
            onChange={handleUsernameChange}
            className="p-1 border rounded text-sm w-32" // Adjusted width
          />
          {showConfirmUsername && editingUsername !== u.username && (
            <>
              <button
                onClick={confirmUsernameUpdate}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                Save
              </button>
               <button
                onClick={cancelUsernameUpdate}
                className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 text-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
      <td className="py-2 px-4 text-sm text-gray-700">
         <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editingNickname}
            onChange={handleNicknameChange}
            className="p-1 border rounded text-sm w-32" // Adjusted width
          />
          {showConfirmNickname && editingNickname !== u.nickname && (
             <>
              <button
                onClick={confirmNicknameUpdate}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                Save
              </button>
              <button
                onClick={cancelNicknameUpdate}
                className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 text-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
       {/* Password Field - Note: Direct password editing is generally discouraged. Consider a 'Reset Password' flow. */}
       <td className="py-2 px-4 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="password"
            placeholder="New Password"
            value={editingPassword}
            onChange={handlePasswordChange}
            className="p-1 border rounded text-sm w-32" // Adjusted width
            disabled={u.id === currentUser.id} // Optionally disable for self
          />
          {showConfirmPassword && editingPassword.trim() && (
            <>
              <button
                onClick={confirmPasswordUpdate}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                Set
              </button>
              <button
                onClick={cancelPasswordUpdate}
                className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 text-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
      <td className="py-2 px-4 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <select
            value={editingRole} // Bind value to the temporary state
            onChange={handleRoleChange} // Use the new handler
            className="p-1 border rounded text-sm w-full" // Use full width of cell
            disabled={u.id === currentUser.id} // Use currentUser prop
          >
            <option value="admin">Admin</option>
            <option value="content_manager">Content Manager</option>
            <option value="commenter">Commenter</option>
            <option value="viewer">Viewer</option>
          </select>
          {showConfirmRole && editingRole !== u.role && ( // Show buttons only if role changed
            <>
              <button
                onClick={confirmRoleUpdate}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                Apply
              </button>
              <button
                onClick={cancelRoleUpdate}
                className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 text-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
      <td className="py-2 px-4 text-sm text-gray-700">
        <button
          onClick={() => handleDeleteClick(u.id)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={u.id === currentUser.id} // Disable delete for self
        >
          Delete
        </button>
      </td>
    </tr>
  );
};


const UserManagement = ({ users, user, handleUserUpdate, handleUserDelete }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteClick = (userId) => {
      setUserToDelete(userId);
      setShowConfirmation(true);
    };
    const confirmDelete = () => {
      handleUserDelete(userToDelete);
      setShowConfirmation(false);
      setUserToDelete(null);
    };

    const cancelDelete = () => {
      setShowConfirmation(false);
      setUserToDelete(null);
    };

    return (
      <div className="container mx-auto p-4 shadow-md rounded-lg bg-white">
        <h1 className="text-2xl font-bold mb-1">User Management</h1>
        <p className="text-sm text-gray-600 mb-4">Manage users and their roles.</p>

        <div className="overflow-x-auto"> {/* Added for responsiveness on smaller screens */}
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nickname</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">No users found.</td> {/* Updated colspan */}
                </tr>
              ) : (
                users.map(u => (
                  <UserItem
                    key={u.id}
                    u={u}
                    currentUser={user} // Pass the current logged-in user
                    handleUserUpdate={handleUserUpdate}
                    handleDeleteClick={handleDeleteClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default UserManagement;