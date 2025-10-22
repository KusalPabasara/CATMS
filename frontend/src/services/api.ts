import axios from 'axios';

const DEBUG = false; // set true for local verbose logging

axios.defaults.baseURL = 'http://localhost:5000'; // Your backend URL

// Create a separate axios instance for profile picture uploads
const profileUploadApi = axios.create({
  baseURL: 'http://localhost:5000', // Profile picture upload service
  withCredentials: true
});
axios.defaults.withCredentials = true;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    if (DEBUG) {
      console.log('API →', config.method?.toUpperCase(), config.url);
      // Do not log headers or tokens in production
    }
    
    // Check for admin token first
    let token = localStorage.getItem('token');
    if (DEBUG) {
      console.log('API token(admin) present:', !!token);
    }
    
    // If no admin token, check for patient token
    if (!token) {
      try {
        const patientStorage = localStorage.getItem('patient-auth-storage');
        if (DEBUG) {
          console.log('API patient storage present:', !!patientStorage);
        }
        if (patientStorage) {
          const parsed = JSON.parse(patientStorage);
          token = parsed.state?.token;
          if (DEBUG) {
            console.log('API token(patient) present:', !!token);
          }
        }
      } catch (e) {
        if (DEBUG) console.error('API patient storage parse error');
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // set content-type only when sending a body; axios sets it automatically
      if (config.data && !config.headers['Content-Type']) {
        // leave undefined; axios will infer JSON or form-data
      }
    }
    
    return config;
  },
  (error) => {
    if (DEBUG) console.error('API request error');
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    if (DEBUG) console.log('API ←', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (DEBUG) {
      console.error('API response error:', error.response?.status, error.config?.url);
    }
    
    if (error.response?.status === 401) {
      // Only redirect if we're not on patient login/register pages
      const currentPath = window.location.pathname;
      const isPatientAuth = currentPath.includes('/patient/login') || 
                           currentPath.includes('/patient/register') || 
                           currentPath.includes('/patient/forgot-password');
      
      if (!isPatientAuth) {
        localStorage.removeItem('token');
        localStorage.removeItem('patient-auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add the same interceptors to profile upload API
profileUploadApi.interceptors.request.use(
  (config) => {
    if (DEBUG) console.log('Upload API →', config.method?.toUpperCase(), config.url);
    
    // Check for admin token first
    let token = localStorage.getItem('token');
    if (DEBUG) console.log('Upload token(admin) present:', !!token);
    
    // If no admin token, check for patient token
    if (!token) {
      try {
        const patientStorage = localStorage.getItem('patient-auth-storage');
        if (DEBUG) console.log('Upload patient storage present:', !!patientStorage);
        if (patientStorage) {
          const parsed = JSON.parse(patientStorage);
          token = parsed.state?.token;
          if (DEBUG) console.log('Upload token(patient) present:', !!token);
        }
      } catch (e) {
        if (DEBUG) console.error('Upload patient storage parse error');
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Content-Type for uploads is set automatically by browser when FormData is used
    }
    
    return config;
  },
  (error) => {
    if (DEBUG) console.error('Upload API request error');
    return Promise.reject(error);
  }
);

profileUploadApi.interceptors.response.use(
  (response) => {
    if (DEBUG) console.log('Upload API ←', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (DEBUG) console.error('Upload API response error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      // Only redirect if we're not on patient login/register pages
      const currentPath = window.location.pathname;
      const isPatientAuth = currentPath.includes('/patient/login') || 
                           currentPath.includes('/patient/register') || 
                           currentPath.includes('/patient/forgot-password');
      
      if (!isPatientAuth) {
        localStorage.removeItem('token');
        localStorage.removeItem('patient-auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
export { profileUploadApi };
