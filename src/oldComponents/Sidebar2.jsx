// Sidebar.js
import React from 'react';
import styled from 'styled-components';
import { useSidebar } from '../context/SidebarContext';
import logo from "../assets/udenar.png";
import { v } from "../styles/Variables";
import { AiOutlineLeft, AiOutlineProject, AiOutlineSetting, AiFillApi, AiOutlineUser } from "react-icons/ai";
import { MdOutlineAnalytics, MdLogout} from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuthStore } from "../hooks/useAuthStore";
import { FaHome, FaRegTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import simuladorNode from '../api/SimuladorNodes';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { links, updateLinks } = useSidebar(); // Obtén los enlaces del contexto
  const { startLogout, user } = useAuthStore();
  const nav = useNavigate();
  const ModSidebaropen = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const { setTheme, theme } = useContext(ThemeContext);
  const CambiarTheme = () => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás recuperar este proyecto después de eliminarlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });
  
      if (result.isConfirmed) {
        // Llama a la API para eliminar el proyecto
        const response = await simuladorNode.delete(`delete-network/${id}`);
        
        if (response.status === 200) {
          Swal.fire('¡Eliminado!', 'El proyecto ha sido eliminado exitosamente.', 'success');
          setTimeout( nav("/"), 500);
        } else {
          Swal.fire('Error', 'No se pudo eliminar el proyecto. Intenta nuevamente.', 'error');
        }       
      }

    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al intentar eliminar el proyecto.', 'error');
      console.error('Error al eliminar el proyecto:', error);
    }
  };

  const secondarylinksArray = [
    {
      label: "Home",
      icon: <FaHome />,
      to: "/",
    },
    /*
    {
      label: "Salir",
      icon: <MdLogout />,
      to: "/null",
    },*/
  ];

  return (
    <Container isOpen={sidebarOpen} themeUse={theme}>
      <button className="Sidebarbutton" onClick={ModSidebaropen}>
        <AiOutlineLeft />
      </button>
      <div className="Logocontent">
        <h2>Menu</h2>
        <div className="imgcontent">
          <img src={logo} />
        </div>
      </div>

      <ScrollableContainer>
        {links.map(({ label, to }) => {
          // Verifica si la ruta contiene "/GraphNetwork/" y extrae el projectId
          const match = to.match(/\/GraphNetwork\/([^/]+)/);
          const projectId = match ? match[1] : null;

          return (
            <div className="LinkContainer" style={ {display: "flex"}} key={label}>
              <NavLink
                to={to}
                className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
              >
                <div className="Linkicon">{<AiFillApi />}</div>
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
              {(projectId && sidebarOpen) && (
                <span
                  className="DeleteButton"
                  onClick={() => handleDelete(projectId)}
                  style={{ margin: 'auto' }} // Asegura que el icono quede a la derecha
                >
                  {<FaRegTrashAlt />}
                </span>
              )}
            </div>
          );
        })}
      </ScrollableContainer>

      <Divider />

      {secondarylinksArray.map(({ icon, label, to }) => (
        <div className="LinkContainer" key={label}>
          <NavLink
            to={to}
            className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
          >
            <div className="Linkicon">{icon}</div>
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        </div>
      ))}

      <div className="Themecontent">
        {sidebarOpen && <span className="titletheme">Dark mode</span>}
        <div className="Togglecontent">
          <div className="grid theme-container">
            <div className="content">
              <div className="demo">
                <label className="switch" istheme={theme}>
                  <input
                    istheme={theme}
                    type="checkbox"
                    className="theme-swither"
                    onClick={CambiarTheme}
                  ></input>
                  <span istheme={theme} className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider />
      <div className="LinkContainer">
        <div className="Linkicon p-5">{<AiOutlineUser />} {sidebarOpen && <span>{user.name}</span>}</div>
        <button type="button" 
                className="btn btn-outline-primary " 
                onClick={startLogout}
        >   
          <div className="Linkicon"> {<MdLogout />}  {sidebarOpen && <span>{"Logout"}</span>} </div>
        </button>
      </div>
    </Container>
  );
}

const Container = styled.div`
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.bg};
  position: sticky;
  padding-top: 20px;
  .Sidebarbutton {
    position: absolute;
    top: ${v.xxlSpacing};
    right: -18px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${(props) => props.theme.bgtgderecha};
    box-shadow: 0 0 4px ${(props) => props.theme.bg3},
      0 0 7px ${(props) => props.theme.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    transform: ${({ isOpen }) => (isOpen ? `initial` : `rotate(180deg)`)};
    border: none;
    letter-spacing: inherit;
    color: inherit;
    font-size: inherit;
    text-align: inherit;
    padding: 0;
    font-family: inherit;
    outline: none;
  }
  .Logocontent {
    display: flex;
    flex-direction:row;
    flex-wrap:wrap;
    justify-content: center;
    align-items: center;

    padding-bottom: ${v.lgSpacing};
    .imgcontent {
      display: flex;
      img {
        max-width:100%;
        height: auto;
      }
      cursor: pointer;
      transition: all 0.3s;
      transform: ${({ isOpen }) => (isOpen ? `scale(0.6)` : `scale(0.5)`)};
    }
    h2 {
      display: ${({ isOpen }) => (isOpen ? `block` : `none`)};
    }
  }
  .LinkContainer {
    margin: 6px 0px;
    
    padding: 0 10%;
    :hover {
      background: ${(props) => props.theme.bg3};
    }
    .Links {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: calc(${v.smSpacing}-2px) 0;
      color: ${(props) => props.theme.text};
      height:40px;
      .Linkicon {
        padding: ${v.smSpacing} ${v.mdSpacing};
        display: flex;

        svg {
          font-size: 25px;
        }
      }
      &.active {
        .Linkicon {
          svg {
            color: ${(props) => props.theme.bg4};
          }
        }
      }
    }
  }
  .Themecontent {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .titletheme {
      display: block;
      padding: 30px;
      font-weight: 700;
      opacity: ${({ isOpen }) => (isOpen ? `1` : `0`)};
      transition: all 0.3s;
      white-space: nowrap;
      overflow: hidden;
    }
    .Togglecontent {
      margin: ${({ isOpen }) => (isOpen ? `auto 40px` : `auto 15px`)};
      width: 36px;
      height: 20px;
      border-radius: 10px;
      transition: all 0.3s;
      position: relative;
      .theme-container {
        background-blend-mode: multiply, multiply;
        transition: 0.4s;
        .grid {
          display: grid;
          justify-items: center;
          align-content: center;
          height: 100vh;
          width: 100vw;
          font-family: "Lato", sans-serif;
        }
        .demo {
          font-size: 32px;
          .switch {
            position: relative;
            display: inline-block;
            width: 30px;
            height: 16px;
            .theme-swither {
              opacity: 0;
              width: 0;
              height: 0;
              &:checked + .slider:before {
                left: 2px;
                content: "🌑";
                transform: translateX(16px);
              }
            }
            .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: ${({ themeUse }) =>
                themeUse === "light" ? v.lightcheckbox : v.checkbox};

              transition: 0.4s;
              &::before {
                position: absolute;
                content: "☀️";
                height: 0px;
                width: 0px;
                left: -10px;
                top: 16px;
                line-height: 0px;
                transition: 0.4s;
              }
              &.round {
                border-radius: 34px;

                &::before {
                  border-radius: 50%;
                }
              }
            }
          }
        }
      }
    }
  }
`;
const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.bg3};
  margin: ${v.lgSpacing} 0;
`;
const ScrollableContainer = styled.div`
    max-height: 22vh; 
    overflow-y: auto; 
    border-radius: 2px; 
`;