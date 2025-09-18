import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000'; // Your backend URL

// Create a separate axios instance for profile picture uploads
const profileUploadApi = axios.create({
  baseURL: 'http://localhost:5001', // Profile picture upload service
  withCredentials: true
});
axios.defaults.withCredentials = true;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🌐 API Request headers:', config.headers);
    console.log('🌐 API Request data:', config.data);
    
    // Check for admin token first
    let token = localStorage.getItem('token');
    console.log('🌐 API Request: Admin token from localStorage:', token ? `${token.substring(0, 20)}...` : 'None');
    
    // If no admin token, check for patient token
    if (!token) {
      try {
        const patientStorage = localStorage.getItem('patient-auth-storage');
        console.log('🌐 API Request: Patient storage from localStorage:', patientStorage ? 'Present' : 'None');
        if (patientStorage) {
          const parsed = JSON.parse(patientStorage);
          token = parsed.state?.token;
          console.log('🌐 API Request: Patient token from storage:', token ? `${token.substring(0, 20)}...` : 'None');
        }
      } catch (e) {
        console.error('🌐 API Request: Error parsing patient storage:', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🌐 API Request: Token added to headers');
    } else {
      console.log('🌐 API Request: No token found');
    }
    
    return config;
  },
  (error) => {
    console.error('🌐 API Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    console.log('🌐 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🌐 API Response error:', error.response?.status, error.config?.url);
    console.error('🌐 API Response error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
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
    console.log('🌐 Profile Upload API Request:', config.method?.toUpperCase(), config.url);
    console.log('🌐 Profile Upload API Request headers:', config.headers);
    
    // Check for admin token first
    let token = localStorage.getItem('token');
    console.log('🌐 Profile Upload API Request: Admin token:', token ? 'Found' : 'Not found');
    
    // If no admin token, check for patient token
    if (!token) {
      try {
        const patientStorage = localStorage.getItem('patient-auth-storage');
        console.log('🌐 Profile Upload API Request: Patient storage:', patientStorage);
        if (patientStorage) {
          const parsed = JSON.parse(patientStorage);
          token = parsed.state?.token;
          console.log('🌐 Profile Upload API Request: Patient token from storage:', token ? 'Found' : 'Not found');
        }
      } catch (e) {
        console.error('🌐 Profile Upload API Request: Error parsing patient storage:', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🌐 Profile Upload API Request: Token added to headers:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('🌐 Profile Upload API Request: No token found');
    }
    
    return config;
  },
  (error) => {
    console.error('🌐 Profile Upload API Request error:', error);
    return Promise.reject(error);
  }
);

profileUploadApi.interceptors.response.use(
  (response) => {
    console.log('🌐 Profile Upload API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🌐 Profile Upload API Response error:', error.response?.status, error.config?.url);
    console.error('🌐 Profile Upload API Response error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
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
