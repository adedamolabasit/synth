import { useMutation } from "@tanstack/react-query";
import { updatePublication } from "../api/mutations/updatePublication";

export const useUpdatePublication = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updatePublication(id, status),
  });
