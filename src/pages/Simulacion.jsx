import { useState } from "react";
import styled from "styled-components";
import ReactJson from 'react-json-view';
import { organizeByType } from "../helpers/organizeByType";
import { TablePower2 } from "../components/showTablePower2";


export const Simulacion = ({data}) => {

    const [postResult, setPostResult] = useState({
        organizedData:{}, 
        columns:{}, 
        types:[],
    } ); 
    
    const {organizedData, columns, types} = postResult;

    const handleButtonClick = () => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( data ),
        };

        fetch('http://localhost:3000/', requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data2=>{
            const {objects} = data2;
            const formData = organizeByType(objects);
            setPostResult(formData);
            
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }; 

  return (
    <Container>
        <h1>Resultados</h1>
        {/* Botón para realizar la solicitud POST */}
        <button className="btn btn-primary" onClick={handleButtonClick}>Obtener resultado simulacion</button>
        { postResult  &&( types.map( (list) =><TablePower2 data={organizedData[list]} columns={columns[list]} list={list}/> )
        )} 
    </Container>
  )
}

const Container = styled.div`
 min-height:100vh;
 max-width: 1700px;`;