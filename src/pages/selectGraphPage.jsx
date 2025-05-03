import React, { useState, useEffect } from 'react';
import PlotlyChartComponent from '../components/PlotlyChatComponent';
import styled from 'styled-components';
import { useSidebar } from '../context/SidebarContext';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Necesario para accesibilidad

export const AppGraph = () => {
    const { updateLinks } = useSidebar();
    const { projectId } = useParams();
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState('');

    useEffect(() => {
        updateLinks([
            { label: "Graph Network", to: `/GraphNetwork/${projectId}` },
            { label: "Graph Time series", to: `/Visualizacion/${projectId}` },
            { label: "Edit Project", to: `/EditProject/${projectId}` },
            { label: "View Result", to: `/view/${projectId}` },
            { label: "Data panel", to: `/Livepanel` },
        ]);

        fetch(`http://127.0.0.1:3000/list-csv-files/${projectId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching files');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    setError('No CSV files found for this project.');
                    setFiles([]);
                } else {
                    setFiles(data);
                    setError('');
                }
            })
            .catch(() => {
                setError('Failed to load files.');
                setFiles([]);
            });
    }, [projectId]);

    const handleFileChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedFiles(selectedOptions);
        setLoading(selectedOptions.length > 0);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setFileToDelete('');
        setIsModalOpen(false);
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete) return;

        try {
            const response = await fetch(`http://127.0.0.1:3000/delete-csv-file/${projectId}/${fileToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error deleting file');
            }

            setFiles(files.filter(file => file !== fileToDelete));
            closeModal();
            alert('File deleted successfully');
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete the file.');
        }
    };

    return (
        <Container>
            <div>
                <h1>CSV Data Visualizer</h1>

                {error ? (
                    <div className="alert alert-warning">{error}</div>
                ) : (
                    <>
                        {files.length > 0 ? (
                            <>
                                <select
                                    multiple
                                    onChange={handleFileChange}
                                    value={selectedFiles}
                                    className="form-select form-select-lg mb-3 container-sm"
                                    style={{ height: '150px' }}
                                >
                                    {files.map(file => (
                                        <option key={file} value={file}>{file}</option>
                                    ))}
                                </select>

                                <button 
                                    onClick={openModal} 
                                    className="btn btn-primary btn-lg m-2"
                                >
                                    Manage Files
                                </button>
                            </>
                        ) : (
                            <p>No files available for this project.</p>
                        )}
                    </>
                )}

                {loading && selectedFiles.length > 0 && (
                    selectedFiles.map(file => (
                        <PlotlyChartComponent
                            key={file}
                            projectId={projectId}
                            filename={file}
                        />
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Manage Files"
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
                <h2>Manage Files</h2>
                <p>Select a file to delete:</p>
                <select
                    value={fileToDelete}
                    onChange={(e) => setFileToDelete(e.target.value)}
                    className="form-select"
                >
                    <option value="">-- Select a file --</option>
                    {files.map(file => (
                        <option key={file} value={file}>{file}</option>
                    ))}
                </select>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <button onClick={closeModal} style={{ padding: '10px 20px', background: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Close
                    </button>
                    <button onClick={handleDeleteFile} disabled={!fileToDelete} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Delete
                    </button>
                </div>
            </Modal>
        </Container>
    );
};

const Container = styled.div`
    min-height: 100vh;
    max-width: 100vw;
`;
