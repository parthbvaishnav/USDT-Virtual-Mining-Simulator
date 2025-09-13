import axios from 'axios';

const api = axios.create({
  baseURL: "https://sahiltest.shop/api/"
});

api.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const headers = response.headers;
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
