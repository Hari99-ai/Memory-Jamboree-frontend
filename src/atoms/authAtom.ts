import { atom } from "recoil";
import { getRole } from "../lib";

interface AuthState {
  firstName: string;
  lastName: string;
  email: string;
  otp: string[];
  isLoggedIn: boolean;
  token:string;
}

export const authAtom = atom<AuthState>({
  key: "authAtom",
  default: {
    firstName: "",
    lastName: "",
    email: "",
    otp: Array(5).fill(""),
    isLoggedIn: false,
    token:""
  },
});

export const authTokenState = atom<string | null>({
  key: 'authTokenState', 
  default: null,         
});

export const userRoleAtom = atom<string | null>({
  key: "userRoleAtom",
  default: getRole()
});