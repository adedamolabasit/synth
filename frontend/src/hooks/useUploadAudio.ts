import { useMutation } from "@tanstack/react-query";
import { uploadAudio } from "../api/mutations/uploadAudio";

export const useUploadAudio= () =>
  useMutation({
    mutationFn: ({
      wallet,
      formData,
    }: {
      wallet: string;
      formData: FormData;
    }) => uploadAudio(wallet, formData),
  });
