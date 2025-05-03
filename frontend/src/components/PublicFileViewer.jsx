import React from 'react';
import API_BASE_URL from './config/config.json'; // Adjust the import path as necessary
import { useParams } from 'react-router-dom';

const PublicFileViewer = () => {
	const { filename } = useParams();
	// Assuming the files are served from a specific base URL or API endpoint
	// Adjust the baseURL according to your backend setup
	const fileUrl = `${API_BASE_URL}/public/${filename}`; 

	// Basic check for image types, could be expanded
	const isImage = /\.(jpg|jpeg|png|gif)$/i.test(filename);

	if (!filename) {
		return <div>No filename provided.</div>;
	}

	return (
		<div>
			<h2>Viewing File: {filename}</h2>
			{isImage ? (
				<img src={fileUrl} alt={filename} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
			) : (
				<p>Cannot display this file type. <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download file</a></p>
			)}
		</div>
	);
};

export default PublicFileViewer;
