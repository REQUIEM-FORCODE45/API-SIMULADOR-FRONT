import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import simuladorNode from '../api/SimuladorNodes';
import Swal from 'sweetalert2';
import './App.css';
import { useSidebar } from '../context/SidebarContext';


// Configuración
const TOKEN = '3f6e6440716a8097';
const API_URL = `/api2/${TOKEN}`;


export const NewProject = () => {
  const { updateLinks } = useSidebar(); 
  const [convertedGLM, setConvertedGLM] = useState('');
  const [jsonResult, setJsonResult] = useState(null);
  const [loadingGLM, setLoadingGLM] = useState(true);
  const nav = useNavigate();
  const { projectId } = useParams();

  const onNavigateBack = () => {
    nav(-1);
  };


  // Función para convertir GLM a JSON y guardar el nuevo JSON
  const convertGLMtoJSON = async () => {
    if (loadingGLM || !convertedGLM) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Todavía no se ha cargado el archivo GLM.',
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Convirtiendo GLM a JSON...',
        text: 'Por favor, espera.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const token = Math.floor(Math.random() * 2 ** 32).toString(16).padStart(8, "0");
      const response = await axios.get(`${API_URL}/${token}/open`);

      const blob = new Blob([convertedGLM], { type: 'text/plain' });
      const formDataGlm = new FormData();
      formDataGlm.append(`input${token}.glm`, blob);
      const response2 = await axios.post(`${API_URL}/${token}/upload`, formDataGlm, {
        headers: {
          Accept: 'application/json',
        }
      });
      
      const upfile = await axios.get(`http://localhost:3000/uploadFiles/${projectId}/${token}`);
      console.log(upfile);

      const conversion = await axios.get(`${API_URL}/${token}/run/ -C input${token}.glm -o salida${token}.json`);

      if(conversion.data.status == "ERROR"){
        
        const errorData = await axios.get(`${API_URL}/${token}/download/stderr`);
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'No hemos guardado tu simulacion',
          text: errorData.data.content,
        });

      }else{
        
        const jsonData = await axios.get(`${API_URL}/${token}/download/salida${token}.json`);
        const data = JSON.parse(jsonData.data.content);
        setJsonResult(data);
        // Guardar el nuevo JSON usando la ruta update-network
        await saveUpdatedJSON(data, convertedGLM);
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Conversión Exitosa',
          text: 'El GLM ha sido convertido a JSON correctamente.',
        });
          
      }

      axios.get(`${API_URL}/${token}/close`);




    } catch (error) {
      console.error('Error al convertir GLM a JSON:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo convertir el archivo GLM a JSON.',
      });
    }
  };

  // Función para guardar el JSON actualizado
  const saveUpdatedJSON = async (jsonData, glmData) => {
    try {
      // Hacer la solicitud PUT a la nueva ruta para actualizar la red
      const responsejson = await axios.put(`http://localhost:3000/updateNetwork/${projectId}`, jsonData);
      const formData = new FormData();
      formData.append('glm', glmData || "" );
      const responseglm = await axios.post(`http://localhost:3000/updateGlm/${projectId}`,  formData);
      //console.log('Network actualizada:', response.data);
    } catch (error) {
      //console.error('Error al guardar el nuevo JSON:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el nuevo JSON.',
      });
    }
  };

  useEffect(() => {

    updateLinks([
      {
        label: "Graph Network",
        to: `/GraphNetwork/${projectId}`,
      },
      {
          label: "Graph Time series",
          to: `/Visualizacion/${projectId}`,
      },
      {
          label: "Edit Project",
          to: `/EditProject/${projectId}`,
      },
      {
          label: "View Result",
          to: `/view/${projectId}`,
      },
      {
          label: "Data panel",
          to: `/Livepanel`,
      },
      {
        label: "File Manager",
        to: `/FileManager/${projectId}`,
      },         
    ]);

    //Funcion inicial recoger glm para edicion
    const fetchJSONData = async () => {
      try {
          Swal.fire({
              title: 'Convirtiendo JSON a GLM...',
              text: 'Por favor, espera.',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },             
          });
  
          setLoadingGLM(true);
          
          const startTime = performance.now(); // Comienza a medir el tiempo
          const {data} = await simuladorNode.get(`glm/${projectId}`);
          const endTime = performance.now(); // Finaliza la medición del tiempo
  
          console.log(`Tiempo de respuesta de la API: ${endTime - startTime} ms`);
  
          setConvertedGLM(data.glm);
          setLoadingGLM(false);  
  
          await Swal.close();

          Swal.fire({
            icon: 'success',
            title: 'Conversión Exitosa',
            text: 'Simulacion convertida exitosamente.',
            didOpen: () => {
              Swal.hideLoading()
            },               
          });
  
      } catch (error) {
          console.error('Error al obtener el JSON desde networks:', error);
          Swal.close();
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo obtener el JSON desde la API.',
              didOpen: () => {
                Swal.hideLoading()
              },                
          });

          setLoadingGLM(false);
        }
    };
  

    fetchJSONData();
  }, [projectId]);

  return (
    <Container>
      <div className="App">
        <header className="App-header">
          <h1>Edit Simulation</h1>

          <button className="btn btn-outline-primary" onClick={onNavigateBack}>
            Return
          </button>
          <br />
          <br />
          <MonacoEditor
            height="70vh"
            language="plaintext"
            theme="vs-light"
            value={convertedGLM}
            onChange={(newValue) => setConvertedGLM(newValue)}
            options={{
              selectOnLineNumbers: true,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />

          <button className="btn btn-success m-3" onClick={convertGLMtoJSON}>
            Guardar
          </button>

          {false && (
            <div>
              <h2>Converted JSON Output</h2>
              {/*<pre>{JSON.stringify(jsonResult, null, 2)}</pre>*/}
            </div>
          )}
        </header>
      </div>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  max-width: 100vw;
`;
