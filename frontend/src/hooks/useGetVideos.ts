import { useQuery } from "@tanstack/react-query";
import { getVideos } from "../api/queries/getVideos";

export const useGetVideos = () =>
  useQuery({
    queryKey: ["videos"],
    queryFn: () => getVideos(),
  });
