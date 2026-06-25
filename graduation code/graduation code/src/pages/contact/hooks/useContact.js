import { useMutation } from "@tanstack/react-query";
import { sendContactMessage } from "../../../servises/contact/contact.service";
import toast from "react-hot-toast";

export const useContact = () => {
  return useMutation({
    mutationFn: sendContactMessage,

    onSuccess: () => {
      toast.success("Message sent successfully ✅");
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || "Something went wrong ❌";
      toast.error(message);
    },
  });
};