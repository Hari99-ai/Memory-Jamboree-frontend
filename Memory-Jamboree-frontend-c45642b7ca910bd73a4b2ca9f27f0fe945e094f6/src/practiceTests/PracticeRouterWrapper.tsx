import PracticeRouter from "./PracticeRouter";
import { useLocation } from "react-router-dom";

const PracticeRouterWrapper = () => {
  const location = useLocation();
  const userConfig = location.state?.userConfig || {};

  return <PracticeRouter userConfig={userConfig} />;
};

export default PracticeRouterWrapper;
