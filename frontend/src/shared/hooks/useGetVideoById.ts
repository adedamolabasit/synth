import { useQuery } from "@tanstack/react-query";
import { getVideoById } from "../api/queries/getVideoById";


export const useGetVideoById = (id: string) =>
  useQuery({
    queryKey: ["videos-id", id],
    queryFn: () => getVideoById(id),
    enabled: !!id,
  });
