import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const extractErrorMessage = (error, fallback = 'Something went wrong') => {
  return error?.response?.data?.msg || error?.message || fallback;
};
