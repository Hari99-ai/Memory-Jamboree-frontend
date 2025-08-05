import { atom } from "recoil";

export const authTokenState = atom<string | null>({
  key: "authTokenState",
  default: sessionStorage.getItem("auth_token"),
});

export const userRoleState = atom<"admin" | "user" | null>({
  key: "userRoleState",
  default: sessionStorage.getItem("role") as "admin" | "user" | null,
});
