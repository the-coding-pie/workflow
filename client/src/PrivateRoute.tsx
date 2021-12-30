import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: Props) => {
  const accessToken = "cool";

  const location = useLocation();

  if (!accessToken) {
    return <Navigate replace to="/auth/login" state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;