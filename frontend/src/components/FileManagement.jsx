import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config/config.json';

const FileManagement = ({ user, setError }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper function to adjust path by removing '/public/' prefix if present
  const adjustFilePath = (filePath) => {
    if (filePath && filePath.startsWith('/public/')) {
      return filePath.substring('/public'.length); // Removes '/public' -> '/filename.ext'
    }
    return filePath;
  };


  useEffect(() => {
    const fetchFiles = async () => {
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}public/files`, {
          headers: { token: user?.token },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Error fetching files: ' + err.message);
      }
    };

    fetchFiles();
  }, [user, setError]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('No file selected for upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_BASE_URL}public`, {
        method: 'POST',
        headers: { token: user?.token },
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Failed to upload file');
      }
      const data = await res.json();
      // Adjust the path received from the backend
      const adjustedPath = adjustFilePath(data.path);
      setFiles((prev) => [...prev, adjustedPath]);
      setSelectedFile(null);
      // Clear the file input after successful upload
      if (e.target.querySelector('input[type="file"]')) {
        e.target.querySelector('input[type="file"]').value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error uploading file: ' + err.message);
    }
  };

  // Helper function to extract filename from URL/path
  const getFileName = (filePath) => {
    try {
      // Handles both full URLs and simple paths
      return filePath.substring(filePath.lastIndexOf('/') + 1);
    } catch {
      return filePath; // Fallback to the original string if parsing fails
    }
  };


  return (
    <div>
      <h2 className="text-lg font-bold mb-4">File Management</h2>
      <form onSubmit={handleFileUpload} className="mb-4">
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!selectedFile} // Disable button if no file is selected
        >
          Upload File
        </button>
      </form>
      <h3 className="text-md font-semibold mb-2">Uploaded Files:</h3>
      {files.length > 0 ? (
        <ul>
          {files.map((file, index) => (
            <li key={index} className="mb-1">
              {/* 'file' now contains the adjusted path (e.g., /filename.ext) */}
              <a
                href={file} // Use the adjusted path directly
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {/* Display a cleaner filename */}
                {getFileName(file)}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files uploaded yet.</p>
      )}
    </div>
  );
};

export default FileManagement;