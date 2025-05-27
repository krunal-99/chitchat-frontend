import { toast } from "react-toastify";

export const handleSuccess = (msg: string) => {
  toast.success(msg);
};

export const handleError = (msg: string | string[]) => {
  const errors = Array.isArray(msg)
    ? msg
    : msg.split(",").map((err) => err.trim());

  errors.forEach((error) => {
    toast.error(error);
  });
};

export const handleInfo = (msg: string) => {
  toast.info(msg);
};
