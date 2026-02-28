// import { useState, useEffect } from "react";
// import { isMobile } from "react-device-detect";
// // import { Navigate } from "react-router-dom";
// import NotAllowedPage from "../pages/NotAllowedPages";

// const MobileOnlyRoute = ({ children }: { children: React.ReactNode }) => {
//  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

//   useEffect(() => {
//     setIsAllowed(isMobile);
//   }, []);

//   if (isAllowed === null) return null;
//   if (!isAllowed) return <NotAllowedPage />;
//   return <>{children}</>;
// };

// export default MobileOnlyRoute;
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

const MobileOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    const isMobileDevice = isMobile;

    // Detect mobile browser running in desktop mode
    const isDesktopModeOnMobile =
      isMobileDevice &&
      !ua.includes("mobile") &&
      (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad"));

    if (isMobileDevice && !isDesktopModeOnMobile) {
      setAllowed(true);
    } else {
      setAllowed(false);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Checking device…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            background: "#fff",
            padding: "24px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Mobile Access Only</h2>

          <p style={{ marginTop: "10px" }}>
            This page must be opened on a{" "}
            <strong>mobile phone in normal browser mode</strong>.
          </p>

          <div
            style={{
              background: "#fff3cd",
              padding: "12px",
              borderRadius: "6px",
              marginTop: "12px",
              fontSize: "14px",
            }}
          >
            Please turn <strong>OFF “Desktop site / Desktop mode”</strong> in your
            mobile browser and reload the page.
          </div>

          <p style={{ fontSize: "13px", color: "#666", marginTop: "12px" }}>
            Desktop and desktop-mode access are not supported for this step.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "10px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileOnlyRoute;


// import { useState, useEffect } from "react";
// import { isMobile } from "react-device-detect";
// import NotAllowedPage from "../pages/NotAllowedPages";

// const MobileOnlyRoute = ({ children }: { children: React.ReactNode }) => {
//   const [loading, setLoading] = useState(true);
//   const [isAllowed, setIsAllowed] = useState(false);

//   useEffect(() => {
//     setIsAllowed(isMobile);
//     setLoading(false);
//   }, []);

//   // 🔴 NEVER return null
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAllowed) {
//     return <NotAllowedPage />;
//   }

//   return <>{children}</>;
// };

// export default MobileOnlyRoute;
