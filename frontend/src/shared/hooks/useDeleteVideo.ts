import { useMutation } from "@tanstack/react-query";
import { deleteVideo } from "../api/mutations/deleteVideo";

export const useDeleteVideo = () =>
  useMutation({
    mutationFn: (id: string) => deleteVideo(id),
  });
