import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config/config.json'; // Import API_BASE_URL

const API_BASE_URL = config.API_BASE_URL;

const DesignBlock = ({ user }) => {
  const [designSettings, setDesignSettings] = useState({
    header_text: '',
    primary_color: '#439d2a',
    secondary_color: '#525252',
    logo_url: '', // Changed from logo_img to logo_url
  });
  const [error, setError] = useState('');

  // Fetch initial design settings (optional, but good practice)
  useEffect(() => {
    const fetchDesignSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}design`, {
          headers: { token: user?.token },
        });
        if (res.data) {
          setDesignSettings({
            header_text: res.data.header_text || '1337+',
            primary_color: res.data.primary_color || '#439d2a',
            secondary_color: res.data.secondary_color || '#525252',
            logo_url: res.data.logo_url || 'https://1337.plus/public/logo.png', // Use logo_url
          });
        }
      } catch (err) {
        console.error('Error fetching design settings:', err);
        // Keep default settings if fetch fails
        setDesignSettings({
            header_text: '1337+',
            primary_color: '#439d2a',
            secondary_color: '#525252',
            logo_url: 'https://1337.plus/public/logo.png', // Default logo URL
        });
      }
    };

    if (user?.token) {
      fetchDesignSettings();
    }
  }, [user?.token]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDesignSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleDesignChange = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Prepare JSON payload
      const payload = {
        header_text: designSettings.header_text || '',
        primary_color: designSettings.primary_color || '#000000',
        secondary_color: designSettings.secondary_color || '#000000',
        logo_url: designSettings.logo_url || '', // Send logo_url
      };

      console.log('Sending payload:', payload); // Debug payload

      const res = await axios({
        method: 'PUT',
        url: `${API_BASE_URL}design`,
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
          token: user?.token,
        },
        data: payload, // Send JSON data
      });

      if (res.status !== 200) {
        throw new Error(res.data.error || 'Failed to update design settings');
      }

      alert('Design settings updated successfully!');
    } catch (err) {
      console.error(`Error updating design settings: ${API_BASE_URL}design`, err.response?.data || err.message || err);
      setError(err.response?.data?.error || err.message || 'Error updating design settings');
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Design Front Page</h3>
      <div className="w-500">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleDesignChange} className="space-y-4">
          <div>
            <label htmlFor="header_text" className="block text-sm font-medium text-gray-700">Header Text</label>
            <input
              type="text"
              id="header_text"
              name="header_text"
              value={designSettings.header_text}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mt-1" // Use w-full for better responsiveness
            />
          </div>
          <div>
            <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700">Primary Color</label>
            <input
              type="color"
              id="primary_color"
              name="primary_color"
              value={designSettings.primary_color}
              onChange={handleInputChange}
              className="w-20 h-10 p-1 border rounded mt-1" // Adjusted size
            />
          </div>
          <div>
            <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700">Secondary Color</label>
            <input
              type="color"
              id="secondary_color"
              name="secondary_color"
              value={designSettings.secondary_color}
              onChange={handleInputChange}
              className="w-20 h-10 p-1 border rounded mt-1" // Adjusted size
            />
          </div>
          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">Logo Image URL</label>
            <input
              type="url" // Use type="url" for basic validation
              id="logo_url"
              name="logo_url"
              placeholder="https://1337.plus/public/logo.png"
              value={designSettings.logo_url}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mt-1" // Use w-full
            />
             {designSettings.logo_url && (
                <div className="mt-2">
                    <p className="text-sm text-gray-500">Logo Preview:</p>
                    <img src={designSettings.logo_url} alt="Logo Preview" className="max-h-20 border rounded" onError={(e) => e.target.style.display='none'} onLoad={(e) => e.target.style.display='block'}/>
                </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Design
          </button>
        </form>
      </div>
    </div>
  );
};

export default DesignBlock;