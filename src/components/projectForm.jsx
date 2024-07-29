import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export const ProjectForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const nav = useNavigate();

  const onClikedButton = () =>{
    event.preventDefault();
    nav(-1);
  }

  const fetched = async(url, ops) =>{
    const resp = await fetch(url, ops);
    const data = await resp.json();
    return data;
  }

  const onSubmit = (data) => {
    const file = data.network[0];
    if ( !file ) return;
    const fileReader = new FileReader();
    fileReader.readAsText( file );
    fileReader.onload = async() => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ glm:fileReader.result})
        };
        
        const inputs = await fetched('http://localhost:5000/glm2json', requestOptions);
        const formData = new FormData();
        // Agregar campos de texto al FormData
        formData.append('project_name', data.project_name);
        formData.append('description', data.description);
        formData.append('network_name', data.project_name); // Asumido como el nombre de la red en el body
        formData.append('application', inputs.application);
        formData.append('version', inputs.version);
        formData.append('modules', JSON.stringify(inputs.modules || {}));
        formData.append('types', JSON.stringify(inputs.types || {}));
        formData.append('header', JSON.stringify(inputs.header || {}));
        formData.append('classes', JSON.stringify(inputs.classes || {}));
        formData.append('globals', JSON.stringify(inputs.globals || {}));
        formData.append('schedules', JSON.stringify(inputs.schedules || {}));
        formData.append('objects', JSON.stringify(inputs.objects || {}));

    
        if (data.files.length > 0) {
          for (let i = 0; i < data.files.length; i++) {
            formData.append('files', data.files[i]);
          }
        }
    
        const requestOptions2 = {
          method: 'POST',
          body: formData,
        };
    
        fetch('http://localhost:3000/create-project', requestOptions2)
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    
        /*
        const body = {
          project:{
            project_name: data.project_name,
            description: data.description
          },
          network_name:data.project_name,
          files:data.files,
          ...inputs
        };
        
        console.log(body);
        const ops = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)          
        }

        fetched('http://localhost:3000/create-project', ops);*/
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='container-sm p-4'  >
          <div className="input-group mb-3">
            <label className="input-group-text" htmlFor="project_name">Project Name</label>
            <input 
              className="form-control"
              id="project_name" 
              type="text" 
              {...register('project_name', { required: true })}
            />
            {errors.project_name && <p>Project name is required</p>}
          </div>
          
          <div className="mb-3">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea 
              className="form-control"
              id="description" 
              {...register('description', { required: true })}
            />
            {errors.description && <p>Description is required</p>}
          </div>

          <div className="container-sm border border-secondary rounded ">
            <div className="mb-3">
              <label className="form-label" htmlFor="network">Network</label>
              <input
                className="form-control"
                id="network" 
                type="file" 
                {...register('network', { required: true })}
              />
              {errors.network && <p>Network file is required</p>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="files">files</label>
              <input
                className="form-control"
                multiple
                id="files" 
                type="file" 
                {...register('files', { required: false
                 })}
              />
              {errors.files && <p> files is not required</p>}
            </div>        
          </div>
          <button className="btn btn-outline-primary m-2" type="submit">Submit Project</button>
          <button className="btn btn-outline-primary m-2" onClick={onClikedButton}> Return</button>
        </div>
      </form>
    </Container>
  );
};

const Container = styled.div`
 min-height:100vh;
 max-width: 200vh;`;