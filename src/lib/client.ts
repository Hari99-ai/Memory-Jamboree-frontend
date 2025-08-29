// import axios from "axios";

// export const api = axios.create({
//   baseURL: "https://aidev.gravitinfosystems.com:5000",
//   // baseURL: "https://aidev.memoryjamboree.com:5000",
//   // baseURL: "http://192.168.29.88:8000",
//   withCredentials: false,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

export const SocketURL = `wss://aidev.gravitinfosystems.com:5000/ws`

// export const API_BASE_URL = "https://aidev.gravitinfosystems.com:5000"
// // export const API_BASE_URL = "https://aidev.memoryjamboree.com:5000"
// // export const API_BASE_URL = "http://192.168.29.88:8000"

// export const eventImg = "https://aidev.gravitinfosystems.com:5000/uploads/events"
// // export const eventImg = "https://aidev.memoryjamboree.com:5000/uploads/events"
// // export const eventImg = "http://localhost:7000/uploads/events"

// // export const audoRecords = "C:/Users/devra/OneDrive/Desktop/Gravit/Memory_Game_AI_Proctor_App/backend/uploads/audio-records"

// // export const ImgUrl = "https://aidev.memoryjamboree.com:5000/uploads"
// export const ImgUrl = "https://aidev.gravitinfosystems.com:5000/uploads"
// // export const ImgUrl = "C:/Users/devra/OneDrive/Desktop/Gravit/Memory_Game_AI_Proctor_App/backend/uploads"

// // export const AUDIO_BASE_URL = "https://aidev.memoryjamboree.com:5000/uploads/events/audio-records/";
// export const AUDIO_BASE_URL = "https://aidev.gravitinfosystems.com:5000/uploads/events/audio-records/";



//import axios from "axios";

//export const api = axios.create({
  // baseURL: "https://aidev.gravitinfosystems.com:5000",
  //baseURL: "https://aidev.memoryjamboree.com:5000",
  // baseURL: "http://127.0.0.1:8000",
//   withCredentials: false,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

const API_BASE_URL = "https://aidev.gravitinfosystems.com:5000"
// const  API_BASE_URL = "https://aidev.memoryjamboree.com:5000"
// export const API_BASE_URL = "http://127.0.0.1:8000"

// export const eventImg = "https://aidev.gravitinfosystems.com:5000/uploads/events"
//export const eventImg = "https://aidev.memoryjamboree.com:5000/uploads/events"
// export const eventImg = "http://localhost:7000/uploads/events"

// export const audoRecords = "C:/Users/devra/OneDrive/Desktop/Gravit/Memory_Game_AI_Proctor_App/backend/uploads/audio-records"

//export const ImgUrl = "https://aidev.memoryjamboree.com:5000/uploads"
// export const ImgUrl = "https://aidev.gravitinfosystems.com:5000/uploads"
// export const ImgUrl = "C:/Users/devra/OneDrive/Desktop/Gravit/Memory_Game_AI_Proctor_App/backend/uploads"

//export const AUDIO_BASE_URL = "https://aidev.memoryjamboree.com:5000/uploads/events/audio-records/";
// export const AUDIO_BASE_URL = "https://aidev.gravitinfosystems.com:5000/uploads/events/audio-records/";

import axios from "axios";

//const API_BASE_URL = "https://aidev.gravitinfosystems.com:5000";

// --- Axios Instance Creation ---
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// --- Response Interceptor ---
// This function will run for every API response
api.interceptors.response.use(
  // 1. If the response is successful, just return it
  (response) => response,
  
  // 2. If the response has an error, this part runs
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 (Unauthorized) and if we haven't already retried this request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we are retrying this request

      const refreshToken = sessionStorage.getItem("refresh_token");

      if (!refreshToken) {
        // If no refresh token, logout the user
        sessionStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const formData = new FormData();
        formData.append('refresh_token', refreshToken);
        
        // Use a direct axios call to avoid circular dependency issues with the 'api' instance
        const response = await axios.post(`${API_BASE_URL}/reset_password`, formData);

        const { access_token, refresh_token } = response.data;

        // Update the tokens in session storage
        sessionStorage.setItem("auth_token", access_token);
        sessionStorage.setItem("refresh_token", refresh_token);

        // Update the Authorization header for the original request
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        
        // Set the new token for all subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token is also invalid, logout the user
        console.error("Refresh token failed:", refreshError);
        sessionStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // For any other errors, just return the error
    return Promise.reject(error);
  }
);


// --- Request Interceptor ---
// This adds the auth token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- Other Exports ---
export { API_BASE_URL };
// export const eventImg = "https://aidev.memoryjamboree.com:5000/uploads/events";
// export const ImgUrl = "https://aidev.memoryjamboree.com:5000/uploads";
// export const AUDIO_BASE_URL = "https://aidev.memoryjamboree.com:5000/uploads/events/audio-records/";


export const eventImg = "https://aidev.gravitinfosystems.com:5000/uploads/events"
export const ImgUrl = "https://aidev.memoryjamboree.com:5000/uploads";
export const AUDIO_BASE_URL = "https://aidev.memoryjamboree.com:5000/uploads/events/audio-records/";