import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import styled from 'styled-components';
import simuladorNode from '../api/SimuladorNodes';

Modal.setAppElement('#root'); // Necesario para accesibilidad

const FileManager = () => {
    const { projectId } = useParams();
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    // Fetch files from the server
    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await simuladorNode.get(`list-files/${projectId}`);
            setFiles(response.data);
            setError('');
        } catch (err) {
            setError('Error fetching files');
        } finally {
            setLoading(false);
        }
    };

    // Handle file selection
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await simuladorNode.post(`add-file/${projectId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('File uploaded successfully.');
            fetchFiles();
        } catch (err) {
            setError('Error uploading file.');
        } finally {
            setLoading(false);
        }
    };

    // Open delete modal
    const openDeleteModal = (file) => {
        setFileToDelete(file);
        setIsModalOpen(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setFileToDelete(null);
        setIsModalOpen(false);
    };

    // Handle file deletion
    const handleDeleteFile = async () => {
        if (!fileToDelete) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await simuladorNode.delete(`delete-file/${projectId}/${fileToDelete}`);
            setSuccess('File deleted successfully.');
            fetchFiles();
        } catch (err) {
            setError('Error deleting file.');
        } finally {
            setLoading(false);
            closeDeleteModal();
        }
    };

    return (
        <Container>
            <div className="container mt-4">
                <h1>File Manager</h1>

                {/* Alerts */}
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {success && <div className="alert alert-success mt-3">{success}</div>}

                {/* File Upload */}
                <div className="mb-3">
                    <label htmlFor="file" className="form-label">Select a file to upload</label>
                    <input
                        type="file"
                        className="form-control"
                        id="file"
                        onChange={handleFileChange}
                    />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        'Upload File'
                    )}
                </button>

                {/* File List */}
                <h3 className="mt-4">Existing Files</h3>
                {loading ? (
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                ) : (
                    <ul className="list-group mt-3">
                        {files.map((file) => (
                            <li key={file} className="list-group-item d-flex justify-content-between align-items-center">
                                {file}
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => openDeleteModal(file)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeDeleteModal}
                    contentLabel="Delete File"
                    style={{
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            width: '400px',
                            padding: '20px',
                            borderRadius: '10px',
                        },
                    }}
                >
                    <h2>Delete File</h2>
                    <p>Are you sure you want to delete the file: <strong>{fileToDelete}</strong>?</p>
                    <div className="d-flex justify-content-between mt-4">
                        <button className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleDeleteFile}>Delete</button>
                    </div>
                </Modal>
            </div>
        </Container>
    );
};

export default FileManager;

const Container = styled.div`
    min-height: 100vh;
    max-width: 100vw;
`;

