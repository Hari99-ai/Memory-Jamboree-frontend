import { createBrowserRouter, Outlet} from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader2 from "../components/Loader2";
import Loader from "../components/Loader";
// const Home = lazy(() => import("../Home/HomePage"));
const Login = lazy(() => import("../components/Login"));
const Stepper = lazy(() => import("../components/Stepper"));
const SubscriptionPlans = lazy(() => import( "../admin/Settings/SubscriptionPlans"));
const Masters = lazy(() => import("../admin/Settings/Masters/Masters"));
const SchoolMaster = lazy(() => import("../admin/Settings/Masters/SchoolMaster"));
const CategoryMaster = lazy(() => import("../admin/Settings/Masters/CategoryMaster"));
const ClassMaster = lazy(() => import("../admin/Settings/Masters/ClassMaster"));
import AuthLayout from "../admin/Layout/AuthLayout";
const Dashboard = lazy(() => import("../components/studentComponents/Dashboard"));
const EventView = lazy(() => import("../pages/EventView"));
const PaymentPage = lazy(() => import("../components/PaymentPage"));
// import ResultsCertificate from "./components/ui/ResultsCertificate";
const CertificateViewer = lazy(() => import("../pages/CertificateViewer"));
const MyProfilePage = lazy(() => import("../pages/MyProfilePage"));
const ExamPage = lazy(() => import("../components/ExamPage"));
const GamePage = lazy(() => import("../practiceTests/GamePage"));
// const LiveMonitoring = lazy(() => import("../components/LiveMonitoring")) 
// import AdminDashboard from "./admin/AdminDashboard";
const DashboardLayout = lazy(() => import("../admin/components/DashboardLayout"));
// import PracticeTestPage from "./practiceTests/PracticeTestPage";
// const EventList = lazy(() => import("./History/EventList"));
import SubscriptionCard from "../components/ui/SubscriptionCard";
const ResultsCertificate = lazy(() => import("../components/ui/ResultsCertificate"));
import NotFound from "../components/NotFound";
import { mobileOnlyRoutes } from ".";
import { DesktopOnlyRoute } from "./DesktopRoute";
const ParacticeReport = lazy(() => import( "../admin/components/ParacticeReport"));
// import { DesktopOnlyRoute } from "./DesktopRoute";
// import { mobileOnlyRoutes } from ".";
// import { DesktopOnlyRoute } from "./DesktopRoute";
// import PhoneRouteGuard from "./MobileRoute";
// import MobileLogin from "../mobile/MobileLogin";
// import MobileOnlyRoute from "./MobileRoute";
const PracticePerformance = lazy(() => import("../admin/components/PracticePerformance"));
const Results = lazy(() => import("../admin/Results"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const HelpSupport = lazy(() => import("../pages/HelpSupport"));
const PracticeTestHistory = lazy(() => import("../History/PracticeTestHistory"));
// import HistoryItem from "./components/studentComponents/sidebar/history-item";
// const EventHistory = lazy(() => import("./History/EventHistory"));
const EventGamePage = lazy(() => import("../pages/EventGamePage"));
const MyEvents = lazy(() => import("../pages/MyEvent"));
const AdminChangePassword = lazy(() => import("../admin/AdminChangePassword"));
const UserDetails = lazy(() => import("../admin/Users/UserDetails"));
const UpdateUser  = lazy(() => import( "../admin/Users/UpdateUser"));
const ImportUserExcel = lazy(() => import("../admin/Users/AddUser/ImportUserExcel"));
const EventUsers = lazy(() => import("../admin/Events/EventsList/EventUsers"));
const VerifyOtp = lazy(() => import("../components/VerifyOtp"));
const StudentDashboardLayout = lazy(() => import("../components/studentComponents/StudentDashboardLayout"));
const SingleUserForm = lazy(() => import("../admin/Users/AddUser/SingleUserForm"));
const ManyUserForm = lazy(() => import("../admin/Users/AddUser/ManyUserForm"));
const ProtectedRoute = lazy(() => import("../components/ProtectedRoute")) ;
const Words = lazy(() => import("../admin/libarary/Words"));
const Images = lazy(() => import( "../admin/libarary/Images"));
// import AdminDashboard from "./admin/AdminDashboard";
const PracticeTestSection = lazy(() => import("../practiceTests/practice-tests-section"));
const PracticeTestPage = lazy(() => import("../practiceTests/PracticeTestPage"));
const ForgotPassword = lazy(() => import("../components/ForgotPassword"));
const RegisterPage = lazy(() => import("../components/FirstRegister"));
const Monitorings = lazy(() => import("../admin/LiveMonitoring/Montiorings"));
const AddUserType = lazy(() => import("../admin/Users/AddUser/AddUserType"));
const Users = lazy(() => import("../admin/Users/Users"));
const Disciplines = lazy(() => import("../admin/Disciplines"));
const AdminPage = lazy(() => import("../admin/DashboardHero"));
const EventDetails = lazy(() => import("../admin/Events/EventsList/EventDetails"));
const EventForm = lazy(() => import("../admin/Events/EventForm"));
const ViewEvents = lazy(() => import("../admin/Events/EventsList/ViewEvents"));


export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loader2/>}>
        <Login/>
      </Suspense>
    ),
  },
  {
    path: "/events/:event_id",
    element: (
    <ProtectedRoute>
      <Suspense fallback={<Loader2 />}>
      <DesktopOnlyRoute>
        <EventView />
      </DesktopOnlyRoute>
      </Suspense>
    </ProtectedRoute>
  ),
  },
  {
    path:"/events/:event_id/game/:discipline",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
        <DesktopOnlyRoute>
        <EventGamePage />
        </DesktopOnlyRoute>
      </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: "/payment",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
        <PaymentPage />
      </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/result",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
        <ResultsCertificate />
      </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/certificate-viewer",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
        <CertificateViewer />
      </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
        <MyProfilePage />
      </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/exam",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
        <ExamPage />
      </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/practice-test/:discipline",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
          <PracticeTestPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/game/:discipline",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2 />}>
          <GamePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/live",
  //   element: (
  //     <Suspense fallback={<Loader2 />}>
  //       <LiveMonitoring />
  //     </Suspense>
  //   ),
  // },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2/>}>
          <ChangePassword/>
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path:"/support",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader2/>}>
        <HelpSupport/>
      </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        {/* <DesktopOnlyRoute> */}
          <Outlet />
        {/* </DesktopOnlyRoute> */}
    </ProtectedRoute>
    ),
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Loader2 />}>
                <AdminPage />
              </Suspense>
            ),
          },
          {
            path: "events/view",
            element: (
              <Suspense fallback={<Loader2 />}>
                <ViewEvents />
              </Suspense>
            ),
          },
          {
            path: "events/add",
            element: (
              <Suspense fallback={<Loader2 />}>
                <EventForm />
              </Suspense>
            ),
          },
          {
            path: "event/:event_id",
            element: (
              <Suspense fallback={<Loader2 />}>
                <EventDetails />
              </Suspense>
            ),
          },
          {
            path: "event/users/:event_id",
            element: (
              <Suspense fallback={<Loader2 />}>
                <EventUsers />
              </Suspense>
            ),
          },
          {
            path: "disciplines",
            element: (
              <Suspense fallback={<Loader2 />}>
                <Disciplines />
              </Suspense>
            ),
          },
          {
            path: "monitoring-logs",
            element: (
              <Suspense fallback={<Loader2 />}>
                <Monitorings />
              </Suspense>
            ),
          },
          {
            path:"paractice-test-performance",
            element: (
              <Suspense>
                <PracticePerformance/>
              </Suspense>
            )
          },
          {
            path:"paractice-report",
            element: (
              <Suspense>
                <ParacticeReport/>
              </Suspense>
            )
          },
          {
            path: "users/add",
            element: (
              <Suspense fallback={<Loader2 />}>
                <AddUserType />
              </Suspense>
            ),
          },
          { path: "users/add/single", element: (<Suspense fallback={<Loader2/>}><SingleUserForm /></Suspense>)},
          { path: "users/add/many", element: (<Suspense fallback={<Loader2/>}><ManyUserForm /></Suspense>) },
          { path: "users/add/insert", element: (<Suspense fallback={<Loader2/>}><ImportUserExcel/></Suspense>) },
          {
            path: "users/view",
            element: (
              <Suspense fallback={<Loader2 />}>
                <Users />
              </Suspense>
            ),
          },
          {
            path: "user/update/:id",
            element: (
              <Suspense fallback={<Loader2 />}>
                <UpdateUser />
              </Suspense>
            ),
          },
          {
            path: "user/:id",
            element: (
              <Suspense fallback={<Loader2 />}>
                <UserDetails />
              </Suspense>
            ),
          },
          {
            path:"lib/words",
            element: (
              <Suspense fallback={<Loader2/>}>
                <Words/>
              </Suspense>
            )
          },
          {
            path:"lib/images",
            element: (
              <Suspense fallback={<Loader2/>}>
                <Images/>
              </Suspense>
            )
          },
          {
            path:"change_password",
            element: (
              <Suspense fallback={<Loader2/>}>
                <AdminChangePassword/>
              </Suspense>
            )
          },
          {
            path:"results",
            element: (
              <Suspense fallback={<Loader2/>}>
                <Results/>
              </Suspense>
            )
          },
          {
            path: "settings",
            element: (
              <Suspense fallback={<Loader2 />}>
                <Stepper />
              </Suspense>
            ),
            children: [
              {
                path: "subscription",
                element: (
                  <Suspense fallback={<Loader2 />}>
                    <SubscriptionPlans />
                  </Suspense>
                ),
              },
              {
                path: "masters",
                element: (
                  <Suspense fallback={<Loader2 />}>
                    <Masters />
                  </Suspense>
                ),
                children: [
                  {
                    path: "schools",
                    element: (
                      <Suspense fallback={<Loader2 />}>
                        <SchoolMaster />
                      </Suspense>
                    ),
                  },
                  {
                    path: "classes",
                    element: (
                      <Suspense fallback={<Loader2 />}>
                        <ClassMaster />
                      </Suspense>
                    ),
                  },
                  {
                    path: "categories",
                    element: (
                      <Suspense fallback={<Loader2 />}>
                        <CategoryMaster />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        {/* <DesktopOnlyRoute> */}
          <Outlet />
        {/* </DesktopOnlyRoute> */}
    </ProtectedRoute>
    ),
    children: [
      {
        element: <StudentDashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "events", element: <MyEvents /> },
          { path: "practiceTests", element: <PracticeTestSection /> },
          // { path: "history-events", element: <EventList /> },
          { path: "payments", element: <SubscriptionCard /> },
          { path: "results", element: <ResultsCertificate /> },
          {path: "history",element: <PracticeTestHistory />}
        ],
      },
    ],
  },
  {
    path: "/otp-verify",
    element: (
      <Suspense fallback={<Loader2 />}>
        <VerifyOtp />
      </Suspense>
    ),
  },
  {
    path: "/auth",
    element: (
      // <DesktopOnlyRoute>
        <Suspense fallback={<Loader />}>
          <AuthLayout />
        </Suspense>
      // </DesktopOnlyRoute>
    ),
    children: [
      // {
      //   path: "login",
      //   element: (
      //     <Suspense fallback={<Loader2 />}>
      //       <Login />
      //     </Suspense>
      //   ),
      // },
      {
        path: "first-register",
        element: (
          <Suspense fallback={<Loader2 />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<Loader2 />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    path:"*",
    element: (
      <Suspense fallback={<Loader2/>}>
        <NotFound/>
      </Suspense>
    )
  },


  // for mobile Routes
  ...mobileOnlyRoutes
]);
