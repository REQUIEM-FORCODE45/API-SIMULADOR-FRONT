import React, { useContext, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../../context/ThemeContext';
import { useForm } from '../../hooks/useForm';
import { useAuthStore } from '../../hooks/useAuthStore';
import { v } from "../../styles/Variables";
import Swal from 'sweetalert2';

const registerFormFields = {
    registerName:      '',
    registerEmail:     '',
    registerPassword:  '',
    registerPassword2: '',
}

export const RegisterPage = () => {

  const { startRegister, errorMessage } = useAuthStore();
  const { theme } = useContext(ThemeContext);
  const { registerEmail, registerName, registerPassword, registerPassword2, onInputChange:onRegisterInputChange } = useForm( registerFormFields );

  const onRegister = (event) => {
    event.preventDefault();
    if ( registerPassword !== registerPassword2 ) {
        Swal.fire('Error en registro', 'Contraseñas no son iguales', 'error');
        return;
    }

    startRegister({ name: registerName, email: registerEmail, password: registerPassword });
  }

  useEffect(() => {
    if (errorMessage !== undefined) {
      Swal.fire('Error en el registro', errorMessage, 'error');
    }
  }, [errorMessage]);

  return (
    <PageContainer>
      <FormContainer>
        <h1>Register</h1>
        <hr />
        <form onSubmit={onRegister}>
          <div className='mb-3 row'>
            <label htmlFor="name" className="col-sm-4 col-form-label">Name</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                name="registerName"
                value={ registerName }
                onChange={ onRegisterInputChange }
              />
            </div>
          </div>

          <div className='mb-3 row'>
            <label htmlFor="email" className="col-sm-4 col-form-label">Email</label>
            <div className="col-sm-8">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                name="registerEmail"
                value={ registerEmail }
                onChange={ onRegisterInputChange }
              />
            </div>
          </div>

          <div className='mb-3 row'>
            <label htmlFor="password" className="col-sm-4 col-form-label">Password</label>
            <div className="col-sm-8">
              <input
                type="password"
                className="form-control"
                placeholder="Password" 
                name="registerPassword"
                value={ registerPassword }
                onChange={ onRegisterInputChange }
              />
            </div>
          </div>

          <div className='mb-3 row'>
            <label htmlFor="verifyPassword" className="col-sm-4 col-form-label">Verify Password</label>
            <div className="col-sm-8">
              <input
                type="password"
                className="form-control"
                placeholder="Repite password" 
                name="registerPassword2"
                value={ registerPassword2 }
                onChange={ onRegisterInputChange }
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Register
          </button>
          <Divider />
            <div className="LinkContainer" key='registerLink'>
                <NavLink
                to={'/auth/login'}
                >
                login

                </NavLink>
            </div>
        </form>
      </FormContainer>
    </PageContainer>
  )
}

const PageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f0f0f0'};
`;

const FormContainer = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
`;

const Divider = styled.div`
    height: 1px;
    width: 100%;
    background: ${(props) => props.theme.bg3};
    margin: ${v.lgSpacing} 0;
`;