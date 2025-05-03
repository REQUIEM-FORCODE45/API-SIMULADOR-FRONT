import React, { useContext, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { v } from "../../styles/Variables";
import { AuthContext } from '../context';
import styled from 'styled-components';
import { ThemeContext } from '../../context/ThemeContext';
import { useForm } from '../../hooks/useForm';
import { useAuthStore } from '../../hooks/useAuthStore';
import Swal from 'sweetalert2';

const loginFormFields = {
  loginEmail:    '',
  loginPassword: '',
}

export const LoginPage = () => {

    const { startLogin, errorMessage } = useAuthStore();
    //const { register, handleSubmit, formState: { errors } } = useForm();
    const { theme } = useContext( ThemeContext );
    const { loginEmail, loginPassword, onInputChange:onLoginInputChange } = useForm( loginFormFields );

    const onLogin = (event) =>{
        event.preventDefault();
        startLogin({ email: loginEmail, password: loginPassword });
    }
  
    useEffect(() => {
      if ( errorMessage !== undefined ) {
        Swal.fire('Error en la autenticación', errorMessage, 'error');
      }    
    }, [errorMessage])

    return (
      <PageContainer>
        <FormContainer>
          <h1>Login</h1>
          <hr />
          <form onSubmit={onLogin}>
            <div className='mb-3 row'>
              <label htmlFor="name" className="col-sm-4 col-form-label">Email</label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Correo"
                  name="loginEmail"
                  value={ loginEmail }
                  onChange={ onLoginInputChange }
            
                />
               
              </div>
            </div>
  
            <div className='mb-3 row'>
              <label htmlFor="password" className="col-sm-4 col-form-label">Password</label>
              <div className="col-sm-8">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  name="loginPassword"
                  value={ loginPassword }
                  onChange={ onLoginInputChange }
                />
                
              </div>
            </div>
  
            <button
              type="submit"
              className="btn btn-primary"
            >
              Login
            </button>
            <Divider />
            <div className="LinkContainer" key='registerLink'>
              <NavLink
                to={'/auth/register'}
              >
                Create account

              </NavLink>
            </div>
          </form>
        </FormContainer>
      </PageContainer>
    )
  }
  //background-color: ${props => props.theme === 'dark' ? '#333' : '#f0f0f0'};
  const PageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    
  `;
  
  const FormContainer = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  `;

  const Divider = styled.div`
    height: 1px;
    width: 100%;
    background: ${(props) => props.theme.bg3};
    margin: ${v.lgSpacing} 0;
`;