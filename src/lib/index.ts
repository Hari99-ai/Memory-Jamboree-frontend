/* eslint-disable @typescript-eslint/no-explicit-any */
import {jwtDecode} from 'jwt-decode'
 
interface TokenPayload {
    role: string;
    [key: string]: any; 
}

export const getRole = ():string | null => {

    const token = sessionStorage.getItem('auth_token')

    if(!token) return null

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.role || null;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}


export const getAuthToken = () => {
    return sessionStorage.getItem('auth_token')
}



export const convertToIST = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') return "Invalid Time";

  try {
    // Assuming the source time is in UTC or a compatible format
    const date = new Date(timeString.replace(' ', 'T') + 'Z');

    // Add 5 hours and 30 minutes for IST offset
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);

    // Format the date back to a readable string
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error converting time:", error);
    return timeString; // Return original string on error
  }
};