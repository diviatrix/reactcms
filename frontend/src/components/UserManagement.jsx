const UserManagement = ({ users, user, handleRoleUpdate }) => {
    return (
      <div className="w-full lg:w-1/2">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u.id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{u.username}</h4>
                  <p className="text-sm text-gray-500">Role: {u.role}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                  className="p-2 border rounded"
                  disabled={u.id === user.id}
                >
                  <option value="admin">Admin</option>
                  <option value="content_manager">Content Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default UserManagement;