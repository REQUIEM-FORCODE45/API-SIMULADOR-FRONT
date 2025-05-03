import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MyRoutes } from './routes'
import { LoginPage } from '../auth/pages/LoginPage'
import { RegisterPage } from '../auth/pages/RegisterPage'
import { useAuthStore } from '../hooks/useAuthStore'

export const LoginRoutes = () => {
    const { status, checkAuthToken } = useAuthStore();

    useEffect(() => {
        checkAuthToken();
    }, [])
    

    if ( status === 'checking' ) {
        return (
            <h3>Cargando...</h3>
        )
    }


    return (
        <> 
            <Routes>
                {
                    ( status === 'not-authenticated')  
                        ? (
                            <>  
                                <Route path="/auth/register" element={  <RegisterPage /> } />
                                <Route path="/auth/*" element={  <LoginPage /> } />
                                <Route path="/*" element={ <Navigate to="/auth/login" /> } />
                            </>
                        )
                        : (
                            <>
                                <Route path="/*" element={ <MyRoutes  /> } />
                                {/*<Route path="/*" element={ <Navigate to="/" /> } />*/}
                            </>
                        )
                }
            </Routes>

        </>
    )
}
