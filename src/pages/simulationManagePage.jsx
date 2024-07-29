import { useEffect } from "react";
import { useFetch } from "../hooks/useFetch"
import { Card2 } from "../components/simulationCard";
import styled from "styled-components";
import { Link } from "react-router-dom";




export const SimulationManagePage = () => {
  const {onSetDataSend, dataSend, loading, dataReceive, }= useFetch('http://localhost:3000/results', {});

  

  useEffect(()=>{
    console.log(dataReceive);
  }, [dataReceive]);


  return (
    <Container>
      <div>
          <h1> Projects </h1>
          <div className="row rows-cols-1 row-cols-md-3 g-3">
              {
                  !loading && (dataReceive.map(project=>{
                    return  <Card2 {...project} />; 
                  }))
              }
          </div>
          <Link to={`/Simulacion`}>
              View result
          </Link>
      </div>
    </Container>
    
  )
}

const Container = styled.div`
 min-height:100vh;
 max-width: 1700px;`;