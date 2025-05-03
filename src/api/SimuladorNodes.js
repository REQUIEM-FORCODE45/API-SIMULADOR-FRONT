import axios from 'axios';
//import { getEnvVariables } from '../helpers';

//const { VITE_API_URL } = getEnvVariables()

const VITE_API_URL = 'http://localhost:3000/';


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


