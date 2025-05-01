import React, { useState } from 'react';
import axios from 'axios';
import config from './config/config.json'; // Import API_BASE_URL

const API_BASE_URL = config.API_BASE_URL;

const DesignBlock = ({ user }) => {
  const [designSettings, setDesignSettings] = useState({
    header_text: '1337+',
    primary_color: '#439d2a',
    secondary_color: '#525252',
    logo_img: '69da57ca1fc90133789ea748db46a383',
  // Default logo image hash
  // This should be replaced with the actual default logo image hash from your database
  });
  const [uploadedFile, setUploadedFile] = useState('69da57ca1fc90133789ea748db46a383');
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState('../assets/1337.png'); // Default logo preview

  // Handle upload file changes
  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
    
    // Create a preview URL for the uploaded image
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  // Add preview of the logo
  React.useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleDesignChange = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      formData.append('header_text', designSettings.header_text || '');
      formData.append('primary_color', designSettings.primary_color || '#000000');
      formData.append('secondary_color', designSettings.secondary_color || '#000000');
      formData.append('logo_img', uploadedFile ? uploadedFile : designSettings.logo_img || '');
  
      // Debug FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      const res = await axios({
        method: 'PUT',
        url: `${API_BASE_URL}design`,
        headers: {
          token: user?.token,
        },
        data: formData,
      });
  
      if (res.status !== 200) {
        throw new Error(res.data.error || 'Failed to update design settings');
      }
  
      alert('Design settings updated successfully!');
      setUploadedFile(null);
    } catch (err) {
      console.error(`Error updating design settings: ${API_BASE_URL}design`, err);
      setError(err.message || 'Error updating design settings');
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Design Front Page</h3>
      <div className="w-500">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleDesignChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Header Text</label>
            <input
              type="text"
              value={designSettings.header_text}
              onChange={(e) => setDesignSettings({ ...designSettings, header_text: e.target.value })}
              className="w-500 p-2 border rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Color</label><input
              type="color"
              value={designSettings.primary_color}
              onChange={(e) => setDesignSettings({ ...designSettings, primary_color: e.target.value })}
              className="w-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
            <input
              type="color"
              value={designSettings.secondary_color}
              onChange={(e) => setDesignSettings({ ...designSettings, secondary_color: e.target.value })}
              className="w-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload a File</label>
            <input
              type="file"
              onChange={handleUploadChange}
              className="w-300 p-2 border rounded mt-1"
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
    </div>
  );
};

export default DesignBlock;