import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSidebar } from '../context/SidebarContext';
import axios from 'axios';

// Configuración
const TOKEN  = '3f6e6440716a8097';
const API_URL = `/api2/${TOKEN}`;


export const ProjectForm = () => {
  const { links, updateLinks } = useSidebar(); 
  const { register, handleSubmit, formState: { errors } } = useForm();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const onClikedButton = (event) => {
    event.preventDefault();
    nav(-1);
  };

  const fetched = async (url, ops) => {
    const resp = await fetch(url, ops);
    const data = await resp.json();
    return data;
  };

  const onSubmit = async (data) => {

    const token = Math.floor(Math.random() * 2 ** 32).toString(16).padStart(8, "0");
    const response = await axios.get(`${API_URL}/${token}/open`);
    const file = data.network[0];
 
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.readAsText(file);

    fileReader.onload = async () => {
      
      Swal.fire({
        title: 'Please wait...',
        text: 'Processing your project...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      //subir red o network de simulacion
      const formDataGlm = new FormData();
      formDataGlm.append(file.name, file);
      const response2 = await axios.post(`${API_URL}/${token}/upload`, formDataGlm, {
        headers: {
          Accept: 'application/json',
        }
      });

      //convertir red a json
      const conversion = await axios.get(`${API_URL}/${token}/run/ -C ${file.name} -o salida${token}.json`);
      const conversion2 = await axios.get(`${API_URL}/${token}/run/ -C salida${token}.json -o salida${token}.glm`);
      const jsonData = await axios.get(`${API_URL}/${token}/download/salida${token}.json`);
      const glmData = await axios.get(`${API_URL}/${token}/download/salida${token}.glm`);
      axios.get(`${API_URL}/${token}/close`);
      console.log(glmData);
      const glm2 = glmData.data.content;
      const inputs = JSON.parse(jsonData.data.content)
      console.log(inputs);

      /*const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: 1, glm: fileReader.result }),
      };
      const inputs = await fetched('http://localhost:3000/glm2json', requestOptions);*/

      const formData = new FormData();
      formData.append('id', user.uid);
      formData.append('project_name', data.project_name);
      formData.append('description', data.description);
      formData.append('network_name', data.project_name);
      formData.append('application', inputs.application);
      formData.append('version', inputs.version);
      formData.append('modules', JSON.stringify(inputs.modules || {}));
      formData.append('types', JSON.stringify(inputs.types || {}));
      formData.append('header', JSON.stringify(inputs.header || {}));
      formData.append('classes', JSON.stringify(inputs.classes || {}));
      formData.append('globals', JSON.stringify(inputs.globals || {}));
      formData.append('schedules', JSON.stringify(inputs.schedules || {}));
      formData.append('objects', JSON.stringify(inputs.objects || {}));
      formData.append('glm', glm2 || "" );

      if (data.files.length > 0) {
        for (let i = 0; i < data.files.length; i++) {
          formData.append('files', data.files[i]);
        }
      }

      const requestOptions2 = {
        method: 'POST',
        body: formData,
      };

      try {
        const response = await fetch('http://localhost:3000/create-project', requestOptions2);
        const result = await response.json();

        Swal.close(); // Cerrar la pantalla de carga

        // Mostrar alerta de éxito usando SweetAlert2
        Swal.fire({
          title: 'Success!',
          text: 'Project has been saved successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        console.log('Success:', result);
        
      } catch (error) {
        Swal.close(); // Cerrar la pantalla de carga
        console.error('Error:', error);

        
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred while saving the project.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    };
  };

  return (
    <Container>
      <FormContainer className="container-sm p-4 border rounded">
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-3">
            <div className="input-group mb-3">
              <span className="input-group-text" id="inputGroup-sizing-sm">Project Name</span>
              <input
                className="form-control"
                id="project_name"
                type="text"
                {...register('project_name', { required: true })}
              />
              {errors.project_name && <p className="text-danger">Project name is required</p>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              className="form-control"
              id="description"
              {...register('description', { required: true })}
            />
            {errors.description && <p className="text-danger">Description is required</p>}
          </div>

          <div className="border p-3 mb-3 rounded">
            <div className="mb-3">
              <label className="form-label" htmlFor="network">Network</label>
              <input
                className="form-control"
                id="network"
                type="file"
                {...register('network', { required: true })}
              />
              {errors.network && <p className="text-danger">Network file is required</p>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="files">Files</label>
              <input
                className="form-control"
                multiple
                id="files"
                type="file"
                {...register('files')}
              />
            </div>

          </div>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-outline-primary" type="submit">Submit Project</button>
            <button className="btn btn-outline-secondary" onClick={onClikedButton}>Return</button>
          </div>

        </form>

      </FormContainer>
    </Container>
  );
};

// Estilos personalizados
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const FormContainer = styled.div`
  width: 30vw;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

export default ProjectForm;
