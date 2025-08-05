import axios from "axios";

export const api = axios.create({
  baseURL: "https://aidev.gravitinfosystems.com:5000",
  // baseURL: "https://aidev.memoryjamboree.com:5000",
  // baseURL: "http://127.0.0.1:8000",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const API_BASE_URL = "https://aidev.gravitinfosystems.com:5000"
// export const API_BASE_URL = "https://aidev.memoryjamboree.com:5000"
// export const API_BASE_URL = "http://127.0.0.1:8000"

export const eventImg = "https://aidev.gravitinfosystems.com:5000/uploads/events"
// export const eventImg = "https://aidev.memoryjamboree.com:5000/uploads/events"
// export const eventImg = "http://localhost:7000/uploads/events"

// export const audoRecords = "C:/Users/devra/OneDrive/Desktop/Gravit/Memory_Game_AI_Proctor_App/backend/uploads/audio-records"

// export const ImgUrl = "https://aidev.memoryjamboree.com:5000/uploads"
export const ImgUrl = "https://aidev.gravitinfosystems.com:5000/uploads"
// export const ImgUrl = "C:/Users/devra/OneDrive/Desktop/Gravit/Memory_Game_AI_Proctor_App/backend/uploads"

// export const AUDIO_BASE_URL = "https://aidev.memoryjamboree.com:5000/uploads/events/audio-records/";
export const AUDIO_BASE_URL = "https://aidev.gravitinfosystems.com:5000/uploads/events/audio-records/";