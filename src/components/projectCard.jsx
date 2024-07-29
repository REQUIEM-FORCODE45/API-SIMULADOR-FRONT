import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components";
import { ThemeContext } from "../App";
import { useContext } from "react";


export const Card1 = ({ project_name, description, id_network}) => {

  const { setTheme, theme } = useContext(ThemeContext);
  const nav = useNavigate();
  const onNavigateBack = () =>{
    nav(`/view/${id_network }`);
  };

  return (

        <div className="col">
            <div className={`card ${theme === "dark" ? "bg-dark text-white" : "bg-light"}`}>

                <div className="row no-gutters">
 
                    <div className="col-4">
                        <img src="/assets/casas-panel2.svg"  className="card-img" />
                    </div>     

                    <div className="col-8">

                        <div className="card-body">

                            <h5 className="card-title"> {project_name }</h5>
                            <p className="card-text">{ description}</p>


                            <button className="btn btn-outline-primary"
                                    onClick={onNavigateBack}>
                                    Details..
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>   

  )
}

