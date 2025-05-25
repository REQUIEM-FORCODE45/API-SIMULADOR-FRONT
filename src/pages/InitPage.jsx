import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import simuladorNode from '../api/SimuladorNodes';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSidebar } from '../context/SidebarContext';

export const InitPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { links, updateLinks } = useSidebar();
  const onCreateProjectClick = () => {

    navigate("/NewProject");
    
  };

  const onOpenProjectClick = async () => {
   
    const { data } = await simuladorNode.get(`projectsList/${user.uid}`);
    console.log(data);
    updateLinks(data);

  };

  useEffect(() => {
    updateLinks([]);
  }, [])
  
  return (
    <PageContainer>
      <ButtonContainer>
        <StyledButton className="btn btn-primary" onClick={onCreateProjectClick}>
          Create projects
        </StyledButton>
        <StyledButton className="btn btn-success" onClick={onOpenProjectClick}>
          Open projects
        </StyledButton>
      </ButtonContainer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;                          /* Asegura que el contenedor ocupe al menos el alto de la ventana */
  width: calc(100vw - var(--sidebar-width));  /* Ajusta el ancho total para el contenedor */
  padding-left: var(--sidebar-width);         /* Alinea el contenido a la derecha del sidebar */
  box-sizing: border-box;
  color: ${(props) => props.theme.text};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 200px; 

  &.btn-primary {
    background-color: #6699CC; 
    color: white;

    &:hover {
      background-color: #0056b3; 
    }
  }

  &.btn-success {
    background-color: #28a745; 
    color: white;

    &:hover {
      background-color: #218838; 
    }
  }
`;

