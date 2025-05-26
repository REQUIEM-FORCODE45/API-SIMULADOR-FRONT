import axios from 'axios';
//import { getEnvVariables } from '../helpers';

//const { VITE_API_URL } = getEnvVariables()
// http://localhost:3000/
// 162.243.73.138

const VITE_API_URL = process.env.API_URL || 'http://localhost:3000/';


const simuladorNode = axios.create({
    baseURL: VITE_API_URL
});

// Todo: configurar interceptores
simuladorNode.interceptors.request.use( config => {

    config.headers = {
        ...config.headers,
        'x-token': localStorage.getItem('token')
    }

    return config;
})


export default simuladorNode;


