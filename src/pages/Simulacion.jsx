import { useState } from "react";
import styled from "styled-components";
import ReactJson from 'react-json-view';
import { organizeByType } from "../helpers/organizeByType";
import { TablePower2 } from "../components/showTablePower2";
import { useNavigate } from "react-router-dom";


export const Simulacion = ({data}) => {

    const [postResult, setPostResult] = useState({
        organizedData:{}, 
        columns:{}, 
        types:[],
    } ); 
    
    const {organizedData, columns, types} = postResult;
 
    const nav = useNavigate();

    const onNavigateBack = () =>{
        nav(-1);
    }    

    const handleButtonClick = async() => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( data ),
        };

        const resp = await fetch('http://localhost:3000/', requestOptions)
        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }
        const {objects} = await resp.json();
        const formData = organizeByType(objects);
        setPostResult(formData);
    }; 

  return (
    <Container>
        <h1>Result</h1>
        <button className="btn btn-outline-primary"
                onClick={onNavigateBack}>
                        Return
        </button>
        <br/><br/>        
        {/* Botón para realizar la solicitud POST */}
        <button className="btn btn-primary" onClick={handleButtonClick}>Obtener resultado simulacion</button>
        { postResult  && ( types.map( (list) =><TablePower2 data={organizedData[list]} columns={columns[list]} list={list}/> )) } 
    </Container>
  )
}

const Container = styled.div`
 min-height:100vh;
 max-width: 1700px;`;