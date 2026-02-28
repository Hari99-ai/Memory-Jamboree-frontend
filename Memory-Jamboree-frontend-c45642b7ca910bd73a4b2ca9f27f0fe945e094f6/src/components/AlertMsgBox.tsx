import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const AlertMsgBox = () => {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const alertShown = localStorage.getItem("profile-alert-shown");
    
    if (!alertShown) {
      setVisible(true);
      localStorage.setItem("profile-alert-shown", "true");

      // Start auto-dismiss timer
      setTimeout(() => {
        setAnimateOut(true); // Start zoom-out animation
        setTimeout(() => setVisible(false), 300); // Remove after animation
      }, 5000);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="relative mt-10">
      <div
        className={`
          absolute flex right-10 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-md shadow-lg text-sm text-gray-800 w-56 z-50 transition-transform duration-300
          ${animateOut ? "scale-0" : "scale-100"}
        `}
      >
        {/* Arrow shaft
        <div className="absolute right-full top-1/2 -translate-y-1/2 w-6 h-1 bg-yellow-100 shadow-md"></div> */}

        {/* Arrow head */}
        <div className="absolute -right-4 top-1/4 -translate-y-1/4 w-0 h-4 
          border-t-[10px] border-b-[10px] border-l-[30px] 
          border-t-transparent border-b-transparent border-l-white">
        </div>

        <AlertTriangle className="w-5 h-5 text-red-600" />
        <p className="ml-2">Please update your profile</p>
      </div>
    </div>
  );
};

export default AlertMsgBox;



// import { AlertTriangle } from "lucide-react";
// import { useEffect, useState } from "react";

// export const AlertMsgBox = () => {
//   const [visible, setVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => setVisible(false), 10000); // Hide after 5s
//     return () => clearTimeout(timer); // Cleanup on unmount
//   }, []);

//   if (!visible) return null;

//   return (
//  <div className="relative mt-10 ">
//   <div className="absolute flex right-10 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-md shadow-lg text-sm text-gray-800 w-56 z-50">
    
//     <div className="absolute -right-2 top-1/3 -translate-y-1/2 w-0 h-0 
//       border-t-[20px] border-b-[20px] border-l-[20px] 
//       border-t-transparent border-b-transparent border-l-white">
//     </div>

//     <AlertTriangle className="w-5 h-5 text-red-600" />
//     <p className="ml-2">Please update your profile</p>
//   </div>
// </div>

//   );
// };

// export default AlertMsgBox
