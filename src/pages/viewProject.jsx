import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import styled from "styled-components";
import { organizeObjects } from "../helpers/organizeObjects";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { organizeByType } from "../helpers/organizeByType";
import Swal from 'sweetalert2';
import { useSidebar } from "../context/SidebarContext";
import TablePower2 from "../components/showTablePower2";

export const View = () => {
    const { updateLinks } = useSidebar(); 
    const { setTheme, theme } = useContext(ThemeContext);
    const { projectId } = useParams();
    const nav = useNavigate();
    const { dataReceive } = useFetch(`http://localhost:3000/networks/${projectId}`, {});
    const [Input, setInput] = useState({
        classifiedObjects: {}, 
        columns: {}, 
        uniqueNames: []
    });

    const [postResult, setPostResult] = useState({
        organizedData: {}, 
        columns: {}, 
        types: [],
    });
    
    const columns2 = postResult.columns;
    const { organizedData, types } = postResult;
    const { uniqueNames } = Input;

    const onNavigateBack = () => {
        nav(-1);
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
        const data = organizeObjects(dataReceive.objects);
        setInput(data);
    }, [dataReceive, projectId]);

    useEffect(() => {
        if (dataReceive.length === 0) { 
            console.log("Está vacío!"); 
        }else{
            handleButtonClick();
        }
    }, [dataReceive]);
    
    const handleButtonClick = async () => {
        // Muestra la alerta de carga
        const loadingAlert = Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espera mientras se obtienen los resultados.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const { application, version, modules, types, header, classes, globals, schedules, objects, _id } = dataReceive;
        const input_value = { 
            application, 
            version, 
            modules, 
            types, 
            header, 
            classes, 
            globals, 
            schedules, 
            objects
        };
        
        console.log(input_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputData: input_value,
                id: _id,
            }),
        };

        try {
            const resp = await fetch('http://localhost:3000/test', requestOptions);
            if (!resp.ok) {
                throw new Error('Network response was not ok');
            }
            const resp_data = await resp.json();
            const formData = organizeByType(resp_data.objects);
            setPostResult(formData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Cierra la alerta de carga
            loadingAlert.close();
        }
    }; 

    return (
        <Container>
            <div className="p-4">
                <h1>Simulate project result</h1>
                <div style={{ marginTop: '20px' }}>
                    {postResult && types.map((list) => (
                        <div key={list} style={{ marginBottom: '15vh' }}>
                            <TablePower2 data={organizedData[list]} columns={columns2[list]} list={list} />
                        </div>
                    ))}
                </div>
                <hr />
                <button className="btn btn-outline-primary" onClick={onNavigateBack}>
                    Return
                </button>
            </div>
        </Container>
    );
};

const Container = styled.div`
    min-height: 100vh;
    max-width: 100vw;
`;
