import { useEffect, useState } from "react";
import { isMobile as isMobileDevice } from "react-device-detect";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(isMobileDevice);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // set initial

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
