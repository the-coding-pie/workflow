import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from "./redux/app";

interface Props {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: Props) => {
  const { accessToken, emailVerified } = useSelector(
    (state: RootState) => state.auth
  );

  const location = useLocation();

  if (!accessToken) {
    return <Navigate replace to="/auth/login" state={{ from: location }} />;
  }

  if (!emailVerified) {
    return (
      <Navigate replace to="/email/notverified" state={{ from: location }} />
    );
  }

  return children;
};

export default PrivateRoute;
