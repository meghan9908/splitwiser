import axios from 'axios';
import './interceptors'; // Import to set up interceptors on apiClient

// This should ideally come from a config file or environment variable
export const API_URL = 'https://splitwiser-dev.up.railway.app';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
