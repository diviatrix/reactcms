import { useState, useEffect } from 'react'; // Add useEffect
import { useNavigate } from 'react-router-dom';
import config from './config/config.json'; // Import the config file

const API_BASE_URL = config.API_BASE_URL;

const AuthForm = ({ onLogin, error, setError }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); // Added nickname state
  const navigate = useNavigate();

  // Clear errors when the component mounts
  useEffect(() => {
    setError('');
  }, [setError]);

  // Handle user registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      setIsRegistering(false);
      setUsername('');
      setPassword('');
      setNickname(''); 
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      onLogin(data);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-500 hover:underline ml-1"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;