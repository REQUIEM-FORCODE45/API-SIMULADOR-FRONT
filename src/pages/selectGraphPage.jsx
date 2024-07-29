import React, { useState, useEffect } from 'react';
import PlotlyChartComponent from '../components/PlotlyChatComponent';
import styled from 'styled-components';

export const AppGraph = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('http://127.0.0.1:3000/projects')
            .then(response => response.json())
            .then(data => {
                const proj = data.map(({ id_network, project_name }) => ({
                    id: id_network,
                    name: project_name,
                }));
                setProjects(proj);
            })
            .catch(error => console.error('Error fetching projects:', error));
    }, []);

    const handleProjectChange = (event) => {
        setLoading(false);
        const projectId = event.target.value;
        setSelectedProject(projectId);
        setSelectedFiles([]);
        fetch(`http://127.0.0.1:3000/list-csv-files/${projectId}`)
            .then(response => response.json())
            .then(data => setFiles(data))
            .catch(error => console.error('Error fetching files:', error));
    };

    const handleFileChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedFiles(selectedOptions);
        setLoading(true);
    };

    return (
        <Container>
            <div>
                <h1>CSV Data Visualizer</h1>
                <select 
                    onChange={handleProjectChange} 
                    value={selectedProject} 
                    className="form-select form-select-lg mb-3"
                >
                    <option value="">Select a Project</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                </select>
                {selectedProject && (
                    <select 
                        multiple 
                        onChange={handleFileChange} 
                        value={selectedFiles} 
                        className="form-select form-select-lg mb-3 container-sm"
                        style={{height: '150px'}}
                    >
                        {files.map(file => (
                            <option key={file} value={file}>{file}</option>
                        ))}
                    </select>
                )}
                {loading && selectedFiles.map(file => (

                    <PlotlyChartComponent 
                        key={file}
                        projectId={selectedProject} 
                        filename={file} 
                    />
                ))}
            </div>
        </Container>
    );
};
const Container = styled.div`
 min-height:100vh;
 max-width: 200vh;`;