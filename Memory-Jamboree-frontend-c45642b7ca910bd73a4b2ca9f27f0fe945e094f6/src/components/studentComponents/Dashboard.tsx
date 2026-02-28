// import { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import ScoreCard from "./dashboard/score-card";
// import ExamScheduleCard from "./dashboard/exam-schedule-card";
// import { MyAchievementsCard } from "./dashboard/my-achievements-card";
// // import { MyEventsCard } from "./dashboard/my-events-card";
// // import { PracticeTestResultCard } from "./dashboard/practice-test-result-card";
// import MyPerformance from "./dashboard/myperformance";
// import UpcomingEvents from "./dashboard/UpcomingEvents";

// export default function Dashboard() {
//   // const [activeSection, setActiveSection] = useState("dashboard")
//   const navigate = useNavigate();
//   const location = useLocation();


//   useEffect(() => {
//     const preventGoBack = () => {
//       navigate(location.pathname, { replace: true });
//     };

//     window.history.pushState(null, "", window.location.href);
//     window.addEventListener("popstate", preventGoBack);

//     return () => {
//       window.removeEventListener("popstate", preventGoBack);
//     };
//   }, [navigate, location.pathname]);
//   return (
//     <div>
//       <h1 className="text-[#245cab] text-center sm:text-left flex items-center justify-center sm:justify-end flex-row-reverse">
//         <img
//           src={"/Landing/memoryChampion_2.png"}
//           alt="img"
//           className="w-36 h-36 object-contain  -mt-8"
//         />
//         <div className="text-right sm:text-left">
//           <span className="block text-xl sm:text-2xl font-medium ml-6">
//             Play and become a
//           </span>
//           <span className="block text-2xl sm:text-3xl font-bold mb-8 ml-6">
//             Memory Champion
//           </span>
//         </div>
//       </h1>

//       {/* Section 1: Image + Cards */}
//       <div className="md:col-span-3">
//         <UpcomingEvents />
//       </div>

//       {/* Section 2: Score */}
//       <div className="mt-10">
//         <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 ml-2 sm:ml-6">
//           Score
//         </h2>
//         <div className="w-full">
//           {/* <PracticeTestResultCard /> */}
//           <MyPerformance />
//         </div>
//       </div>

//       {/* Section 3: Rewards & Achievements */}
//       <div className="mt-10">
//         <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 ml-2 sm:ml-6">
//           Rewards & Achievements
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
//           {/* <div className="p-4 rounded-xl flex items-center justify-center min-h-[200px] bg-white">
//           <img
//             src={"/Landing/memoryChampion.png"}
//             alt="Dashboard illustration"
//             className="w-full max-h-60 object-contain rounded-lg"
//           />
//         </div> */}
//           <MyAchievementsCard />
//           <ScoreCard />
//           <ExamScheduleCard />
//         </div>
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-[40%_60%]">
//           {/* <MyEventsCard /> */}
//         </div>
//       </div>
//     </div>
//   );
// }




import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ScoreCard from "./dashboard/score-card";
import ExamScheduleCard from "./dashboard/exam-schedule-card";
import { MyAchievementsCard } from "./dashboard/my-achievements-card";
// import { MyEventsCard } from "./dashboard/my-events-card";
// import { PracticeTestResultCard } from "./dashboard/practice-test-result-card";
import MyPerformance from "./dashboard/myperformance";
import UpcomingEvents from "./dashboard/UpcomingEvents";
 
export default function Dashboard() {
  // const [activeSection, setActiveSection] = useState("dashboard")
  const navigate = useNavigate();
  const location = useLocation();
 
 
  useEffect(() => {
    const preventGoBack = () => {
      navigate(location.pathname, { replace: true });
    };
 
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventGoBack);
 
    return () => {
      window.removeEventListener("popstate", preventGoBack);
    };
  }, [navigate, location.pathname]);
  return (
    <div>
      <h1 className="text-[#245cab] text-center sm:text-left flex items-center justify-center sm:justify-end flex-row-reverse -mt-5">
        <img
          src={"/Landing/memoryChampion_2.png"}
          alt="img"
          className="w-36 h-36 object-contain  -mt-8"
        />
        <div className="text-right sm:text-left">
          <span className="block text-xl sm:text-2xl font-medium ml-6">
            Play and become a
          </span>
          <span className="block text-2xl sm:text-3xl font-bold mb-6 ml-6">
            Memory Champion
          </span>
        </div>
      </h1>
 
      {/* Section 1: Image + Cards */}
      <div className="md:col-span-3">
        <UpcomingEvents />
      </div>
 
      {/* Section 2: Score */}
      <div className="mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 ml-2 sm:ml-6">
          Score
        </h2>
        <div className="w-full">
          {/* <PracticeTestResultCard /> */}
          <MyPerformance />
        </div>
      </div>
 
      {/* Section 3: Rewards & Achievements */}
      <div className="mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 ml-2 sm:ml-6">
          Rewards & Achievements
        </h2>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {/* <div className="p-4 rounded-xl flex items-center justify-center min-h-[200px] bg-white">
          <img
            src={"/Landing/memoryChampion.png"}
            alt="Dashboard illustration"
            className="w-full max-h-60 object-contain rounded-lg"
          />
        </div> */}
          <MyAchievementsCard />
          <ScoreCard />
          <ExamScheduleCard />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[40%_60%]">
          {/* <MyEventsCard /> */}
        </div>
      </div>
    </div>
  );
}