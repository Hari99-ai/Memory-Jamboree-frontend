import { useAutoLogout } from "../hooks/useAutoLogout";

export const AutoLogoutHandler = () => {
  useAutoLogout(); // runs hook inside router context
  return null;     // no UI
};

