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