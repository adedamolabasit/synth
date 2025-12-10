import { useMutation } from "@tanstack/react-query";
import { updateIpRegistration } from "../api/mutations/updateIpRegistration ";

export const useUpdateIp = () =>
  useMutation({
    mutationFn: ({
      id,
      ipRegistration,
    }: {
      id: string;
      ipRegistration: {
        ipId: string;
        status: string;
        tokenId?: string;
      };
    }) => updateIpRegistration(id, ipRegistration),
  });
