import React from "react";
import GoogleLogin from "react-google-login";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { loginUser } from "../../redux/features/authSlice";

interface Props {
  setCommonError: React.Dispatch<React.SetStateAction<string>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleAuthBtn = ({ setCommonError, setIsSubmitting }: Props) => {
  const dispatch = useDispatch();

  const googleSuccess = async (response: any) => {
    const tokenId = response?.tokenId;

    if (!tokenId) {
      setCommonError("Oops, something went wrong");
    } else {
      axiosInstance
        .post(`/auth/google`, {
          tokenId: tokenId,
        })
        .then((response) => {
          const { data } = response.data;

          setCommonError("");

          setIsSubmitting(false);

          dispatch(
            loginUser({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            })
          );
        })
        .catch((error) => {
          setCommonError("");
          setIsSubmitting(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 400:
              case 500:
                setCommonError(message);
                break;
              default:
                setCommonError("Oops, something went wrong");
                break;
            }
          } else if (error.request) {
            setCommonError("Oops, something went wrong");
          } else {
            setCommonError(`Error: ${error.message}`);
          }
        });
    }
  };

  const googleFailure = (error: any) => {
    setCommonError("Unable to get profile information from Google");
  };

  return (
    <GoogleLogin
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}
      buttonText="Continue with Google"
      onSuccess={googleSuccess}
      onFailure={googleFailure}
      cookiePolicy={"single_host_origin"}
    />
  );
};

export default GoogleAuthBtn;
