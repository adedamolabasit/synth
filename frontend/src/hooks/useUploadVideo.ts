import { useMutation } from "@tanstack/react-query";
import { uploadVideo } from "../api/mutations/uploadVideo";

export const useUploadVideo = () =>
  useMutation({
    mutationFn: ({
      wallet,
      formData,
    }: {
      wallet: string;
      formData: FormData;
    }) => uploadVideo(wallet, formData),
  });
