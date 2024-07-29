import { useEffect } from "react";
import { useFetch } from "../hooks/useFetch"
import { Card1 } from "../components/projectCard";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";



export const ProjectManagePage = () => {
  const {onSetDataSend, dataSend, loading, dataReceive, }= useFetch('http://localhost:3000/projects', {});
  const nav = useNavigate();
  const onNavigateBack = () =>{
    nav("/");
  }

  useEffect(()=>{
    console.log(dataReceive);
  }, [dataReceive]);


  return (
    <Container>
      <div className="p-4">
          <h1> Projects </h1>
          <hr/>
          <div className="row rows-cols-1 row-cols-md-3 g-3">
              {
                  !loading && (dataReceive.map(project=>{
                    return  <Card1 {...project} />; 
                  }))
              }
          </div>

          <div className="m-3">
            <button className="btn btn-outline-primary"
                          onClick={onNavigateBack}>
                              New project
            </button>
          </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
 min-height:100vh;
 max-width: 1700px;`;
