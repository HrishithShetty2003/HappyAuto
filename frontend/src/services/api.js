import axios from 'axios';

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});


// Attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
console.log("🔥 API BASE URL =", process.env.REACT_APP_API_URL);

export default API;

// --- Auth ---
export const login = (data) => API.post('/api/v1/auth/login', data);
export const register = (data) => API.post('/api/v1/auth/register', data);
export const getMe = () => API.get('/api/v1/auth/me');

// --- Deliveries ---
export const bookDelivery = (data) => API.post('/api/v1/deliveries/book', data);
export const getMyDeliveries = () => API.get('/api/v1/deliveries/my-deliveries');
export const getUnassigned = () => API.get('/api/v1/deliveries/unassigned');
export const getCompletedDeliveries = () =>
  API.get("/api/v1/deliveries/completed");
export const getDriverCompletedDeliveries = () =>
  API.get("/api/v1/deliveries/driver/completed");


// --- Driver Actions ---
export const acceptDelivery = (id) => API.post(`/api/v1/deliveries/${id}/accept`);
export const startTrip = (id) => API.post(`/api/v1/deliveries/${id}/start`);
export const completeTrip = (id) => API.post(`/api/v1/deliveries/${id}/complete`);
export const updateDriverStatus = (data) => API.put('/api/v1/deliveries/driver/status', data);
export const updateDriverLocation = (data) => API.put('/api/v1/deliveries/driver/location', data);

