import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../redux/app";
import { removeToast } from "../../redux/features/toastSlice";
import { DEFAULT, ERROR, INFO, SUCCESS, WARNING } from "../../types/constants";

const Toasts = () => {
  const { toasts } = useSelector((state: RootState) => state.toast);

  const dispatch = useDispatch();

  useEffect(() => {
    toasts &&
      toasts.forEach((t) => {
        if (t.kind === ERROR)
          toast.error(t.msg, {
            toastId: t.kind + t.msg,
            onClose: () => {
              dispatch(removeToast(t));
            },
          });
        if (t.kind === SUCCESS)
          toast.success(t.msg, {
            toastId: t.kind + t.msg,
            onClose: () => {
              dispatch(removeToast(t));
            },
          });
        if (t.kind === INFO)
          toast.info(t.msg, {
            toastId: t.kind + t.msg,
            onClose: () => {
              dispatch(removeToast(t));
            },
          });
        if (t.kind === WARNING)
          toast.warn(t.msg, {
            toastId: t.kind + t.msg,
            onClose: () => {
              dispatch(removeToast(t));
            },
          });
        if (t.kind === DEFAULT)
          toast(t.msg, {
            toastId: t.kind + t.msg,
            onClose: () => {
              dispatch(removeToast(t));
            },
          });
      });
  }, [toasts]);
  return <></>;
};

export default Toasts;
