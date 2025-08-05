import "./App.css";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./routes/router";

function App() {
  return (
    <>
      <RouterProvider router={router}/>
      <Toaster />
    </>
  );
}
export default App;
