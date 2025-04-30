import React, { useState } from 'react';
import axios from "axios"; // Make sure you install axios by running `npm install axios` or `yarn add axios` 

const DesignBlock = ({ user }) => {
  const [designSettings, setDesignSettings] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);

  // Handle upload file changes.
  const handleUploadChange = (e) =>{ 
    setUploadedFile(e.target.files[0]);
  };

  // Handle form submission.
  const handleDesignChange = async e => {
    e.preventDefault();

    try {
      const formData = new FormData(); // Create a new instance of FormData.
      formData.append('file', uploadedFile); // Append the file to the form data.
      // You can also append other data like so: 
      formData.append('header_text', designSettings.header_text)
      formData.append('primary_color', designSettings.primary_color)
      formData.append('secondary_color', designSettings.secondary_color)

      const res = await axios({ // Use axios instead of fetch for better handling and error handling capabilities. 
        method: 'PUT',
        url: `${API_BASE_URL}design`,
        headers: { token },
        data: formData
      });

      if (!res.ok) throw new Error(res.error || "Failed to update design settings"); // Throw an error if the request was not successful. 

      alert('Design settings updated successfully!');  // Show a success message on screen.
    } catch (err) {
      console.error(`Error updating design settings: ${API_BASE_URL}/design`, err); // Log any errors that occurred during the request.
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
            onChange={(e) => setDesignSettings({ ...designSettings, header_text: e.target.value})} 
            className="w-full p-2 border rounded mt-1" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload a file:</label>
          <input 
            type="file" 
            onChange={handleUploadChange} 
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
