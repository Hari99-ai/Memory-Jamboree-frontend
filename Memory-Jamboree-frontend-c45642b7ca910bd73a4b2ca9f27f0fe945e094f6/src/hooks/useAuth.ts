// import { useRecoilState } from 'recoil';
// import { authTokenState } from '../atoms/authAtom';
// import { Login, RefreshTokenAPI } from '../lib/api';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getRole } from '../lib';
// import toast from 'react-hot-toast';
// // import { useQuery } from '@tanstack/react-query';
// // import { RegisterUserInput } from '../types';

// export const useAuth = () => {
//   const [token, setToken] = useRecoilState(authTokenState);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const login = async (email: string, password: string) => {
//     const formData = new FormData();
//     formData.append('email', email);
//     formData.append('password', password);
  
//     setLoading(true);
//     try {
//       const response = await Login(formData);
//       console.log("Login response:", response);
  
//       if (response && response.access_token && response.user_id) {
//         sessionStorage.setItem("auth_token", response.access_token);
//         sessionStorage.setItem("refresh_token", response.refresh_token);  // <--- store refresh token
//         sessionStorage.setItem("email", email);
//         sessionStorage.setItem("userId", response.user_id);
//         setToken(response.access_token);

//         const role = getRole(); // now this works!
//         // console.log("role", role);
        
//         if (role === 'admin') {
//           navigate('/admin', { replace: true });
//         } 
//         if (role === 'user') {
//           navigate('/dashboard', { replace: true });
//         }
//       } else {
//         setError("Invalid email or password");
//       }
//     } catch (error:any) {
//       const errorMsg =
//       error?.response?.data?.error || "Failed to login. Please try again.";
//       if (
//         errorMsg.includes("Invalid email or password")
//       ) {
//         toast.error("Invalid email or password");
//       } else if (
//         errorMsg.includes("Email and password are required")
//       ) {
//         toast.error("Email and password are required");
//       } else {
//         toast.error(errorMsg);
//       }
//       console.error("Login failed:", error);
//       setError("An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const logout = () => {
//     sessionStorage.clear();
//     localStorage.clear();
//     setToken(null);
//     navigate('/auth/login');
//   };

//   return { token, login, logout, loading, error , setToken };
// };


// const refreshToken = async () => {
//   const storedRefreshToken = sessionStorage.getItem("refresh_token");
//   if (!storedRefreshToken) {
//     logout();
//     return;
//   }

//   try {
//     const formData = new FormData();
//     formData.append('refresh_token', storedRefreshToken);
//     const response = await RefreshTokenAPI(formData); // your API call function

//     if (response && response.access_token && response.refresh_token) {
//       sessionStorage.setItem("auth_token", response.access_token);
//       sessionStorage.setItem("refresh_token", response.refresh_token);
//       setToken(response.access_token);
//     } else {
//       logout();
//     }
//   } catch (error) {
//     logout();
//   }
// };

import { useRecoilState } from 'recoil';
import { authTokenState } from '../atoms/authAtom';
import { Login, RefreshTokenAPI } from '../lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole } from '../lib';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [token, setToken] = useRecoilState(authTokenState);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setToken(null);
    navigate('/');
  };

  const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    setLoading(true);
    try {
      const response = await Login(formData);
      console.log("Login response:", response);

      if (response && response.access_token && response.refresh_token && response.user_id) {
        sessionStorage.setItem("auth_token", response.access_token);
        sessionStorage.setItem("refresh_token", response.refresh_token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("userId", response.user_id);
        setToken(response.access_token);

        const role = getRole();
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'user') {
            if (role === 'user') {
            navigate("/dashboard", { replace: true });
          }
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Failed to login. Please try again.";
      if (errorMsg.includes("Invalid email or password")) {
        toast.error("Invalid email or password");
      } else if (errorMsg.includes("Email and password are required")) {
        toast.error("Email and password are required");
      } else {
        toast.error(errorMsg);
      }
      console.error("Login failed:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Make refreshToken a method inside the hook so it has access to logout and setToken
  const refreshToken = async () => {
    const storedRefreshToken = sessionStorage.getItem("refresh_token");
    if (!storedRefreshToken) {
      logout();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('refresh_token', storedRefreshToken);
      const response = await RefreshTokenAPI(formData);

      if (response && response.access_token && response.refresh_token) {
        sessionStorage.setItem("auth_token", response.access_token);
        sessionStorage.setItem("refresh_token", response.refresh_token);
        setToken(response.access_token);
      } else {
        logout();
      }
    } catch (error) {
      console.error(error)
      logout();
    }
  };

  return { token, login, logout, loading, error, setToken, refreshToken };

};


// export const useGetUser = (user_id:string) => {
//   return useQuery<RegisterUserInput[]>({
//     queryKey: ['user', user_id],
//     queryFn: () => getUserById(user_id),
//     enabled: !!user_id,
//   });
// }