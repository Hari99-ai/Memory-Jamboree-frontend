// useAutoLogout.ts
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { authTokenState } from "../atoms/authAtom";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  exp: number; // expiration timestamp (in seconds)
  [key: string]: any;
}

export const useAutoLogout = () => {
  const [token, setToken] = useRecoilState(authTokenState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    let logoutTimer: NodeJS.Timeout;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - currentTime;

      if (timeLeft <= 0) {
        // Token already expired
        setToken(null);
        sessionStorage.clear();
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        // Set a timer to logout exactly when token expires
        logoutTimer = setTimeout(() => {
          setToken(null);
          sessionStorage.clear();
          localStorage.clear();
          navigate("/", { replace: true });
        }, timeLeft * 100);
      }
    } catch (error) {
      console.error("Invalid token", error);
      setToken(null);
      sessionStorage.clear();
      localStorage.clear();
      navigate("/", { replace: true });
    }

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [token, setToken, navigate]);
};
