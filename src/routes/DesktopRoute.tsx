import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import NotAllowedPage from "../pages/NotAllowedPages";

export const DesktopOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAllowed(!isMobile);
  }, []);

  if (isAllowed === null) return null;
  if (!isAllowed) return <NotAllowedPage />;
  return <>{children}</>;
};
