import axios from 'axios';
//import { getEnvVariables } from '../helpers';

//const { VITE_API_URL } = getEnvVariables()
// http://localhost:3000/api

const VITE_API_URL = `${process.env.API_URL}api` || 'http://localhost:3000/api/';


const simuladorApi = axios.create({
    baseURL: VITE_API_URL
});

// Todo: configurar interceptores
simuladorApi.interceptors.request.use( config => {

    config.headers = {
        ...config.headers,
        'x-token': localStorage.getItem('token')
    }

    return config;
})


export default simuladorApi;


