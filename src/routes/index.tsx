import ProtectedRoute from "../components/ProtectedRoute";
import EventRegisterd from "../mobile/EventRegisterd";
import MobileLogin from "../mobile/MobileLogin";
import PhoneStream from "../mobile/PhoneStream";
import MobileOnlyRoute from "./MobileRoute";

const mobileRoutes = [
  { path: "/mobile-login", element: <MobileLogin /> },
  {
    path: "/event",
    element: (
      <ProtectedRoute>
        <EventRegisterd />
      </ProtectedRoute>
    ),
  },
  {
    path: "/stream",
    element: (
      <ProtectedRoute>
        <PhoneStream />
      </ProtectedRoute>
    ),
  },
];


export const mobileOnlyRoutes = mobileRoutes.map(({ path, element }) => ({
  path,
  element: <MobileOnlyRoute>
    {element}
  </MobileOnlyRoute>,
}));