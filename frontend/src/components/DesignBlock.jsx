import { useState, useEffect } from 'react';

const DesignBlock = ({ user, token, setError }) => {
  const [designSettings, setDesignSettings] = useState({
    header_text: 'Welcome to Our Website',
    primary_color: '#2563eb',
    secondary_color: '#f97316',
  });

  useEffect(() => {
    // Fetch design settings on mount
    fetch('http://localhost:3001/api/design', {
      headers: { token },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch design settings');
        }
        return res.json();
      })
      .then(data => setDesignSettings(data))
      .catch(err => {
        console.error('Error fetching design settings:', err);
        setError('Error fetching design settings: ' + err.message);
      });
  }, [token, setError]);

  const handleDesignChange = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/design', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify(designSettings),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update design settings');
      }
      alert('Design settings updated successfully!');
    } catch (err) {
      console.error('Error updating design settings:', err);
      setError('Error updating design settings: ' + err.message);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Design Front Page</h3>
      <form onSubmit={handleDesignChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Header Text</label>
          <input
            type="text"
            value={designSettings.header_text}
            onChange={(e) =>
              setDesignSettings({ ...designSettings, header_text: e.target.value })
            }
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Color (Header Background)</label>
          <input
            type="color"
            value={designSettings.primary_color}
            onChange={(e) =>
              setDesignSettings({ ...designSettings, primary_color: e.target.value })
            }
            className="w-full h-10 border rounded mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Secondary Color (Page Background)</label>
          <input
            type="color"
            value={designSettings.secondary_color}
            onChange={(e) =>
              setDesignSettings({ ...designSettings, secondary_color: e.target.value })
            }
            className="w-full h-10 border rounded mt-1"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Design
        </button>
      </form>
    </div>
  );
};

export default DesignBlock;