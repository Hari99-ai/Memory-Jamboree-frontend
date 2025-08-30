// import ProtectedRoute from "../components/ProtectedRoute";
// import EventPhonePage from "../mobile/EventPhonePage";
// import EventRegisterd from "../mobile/EventRegisterd";
import PhoneStreamCam from "../mobile/PhoneStreamCam";
// import FullScreenPhoneStream from "../mobile/PhoneStream";
// import MobileLogin from "../mobile/MobileLogin";
import MobileOnlyRoute from "./MobileRoute";

const mobileRoutes = [
  // // { path: "/mobile-login", element: <MobileLogin /> },
  // {
  //   path: "/event",
  //   element: (
  //     <ProtectedRoute>
  //       <EventRegisterd />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: "/mobile-event/:event_id",
  //   element: (
  //     <ProtectedRoute>
  //       <EventPhonePage />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path:"/monitor",
    element: (
      <PhoneStreamCam/>
    )
  }
];

export const mobileOnlyRoutes = mobileRoutes.map(({ path, element }) => ({
  path,
  element: <MobileOnlyRoute>
    {element}
  </MobileOnlyRoute>,
}));