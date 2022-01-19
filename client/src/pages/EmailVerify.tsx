import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { logoutUser } from "../redux/features/authSlice";
import { addToast } from "../redux/features/toastSlice";
import { ERROR, SUCCESS } from "../types/constants";

const EmailVerify = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    axiosInstance
      .get(`/email/verify/${params.token}?wuid=${searchParams.get("wuid")}`)
      .then((response) => {
        const { message } = response.data;

        dispatch(addToast({ kind: SUCCESS, msg: message }));

        navigate("/", { replace: true });
      })
      .catch((error) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 400:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }

        navigate("/", { replace: true });
      });
  }, []);

  return <div></div>;
};

export default EmailVerify;
