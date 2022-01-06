import axios from "axios";
import React from "react";
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../../config";
import { loginUser } from "../../redux/features/authSlice";

interface Props {
  setGoogleAuthError: React.Dispatch<React.SetStateAction<string>>;
  setCommonError: React.Dispatch<React.SetStateAction<string>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleAuthBtn = ({
  setGoogleAuthError,
  setCommonError,
  setIsSubmitting,
}: Props) => {
  const dispatch = useDispatch();

  const googleSuccess = async (response: any) => {
    const tokenId = response?.tokenId;

    if (!tokenId) {
      setGoogleAuthError("Oops, something went wrong");
    } else {
      axios
        .post(`${BASE_URL}/auth/google`, {
          tokenId: tokenId,
        })
        .then((response) => {
          const { data } = response.data;

          setCommonError("");
          setGoogleAuthError("");

          dispatch(
            loginUser({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            })
          );

          setIsSubmitting(false);
        })
        .catch((error) => {
          setCommonError("");
          setIsSubmitting(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              // bad request or invalid format or unauthorized
              case 400:
              case 500:
                setGoogleAuthError(message);
                break;
              default:
                setGoogleAuthError("Oops, something went wrong");
                break;
            }
          } else if (error.request) {
            setGoogleAuthError("Oops, something went wrong");
          } else {
            setGoogleAuthError(`Error: ${error.message}`);
          }
        });
    }
  };

  const googleFailure = (error: any) => {
    setGoogleAuthError(error);
  };

  return (
    <GoogleLogin
      clientId="628321745921-s94tclhleu517kfhqic9e47jq804bgd3.apps.googleusercontent.com"
      buttonText="Continue with Google"
      onSuccess={googleSuccess}
      onFailure={googleFailure}
      cookiePolicy={"single_host_origin"}
    />
  );
};

export default GoogleAuthBtn;
