import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
export const useUser = (id: string) => {
  const { data, error, isLoading } = useSWR(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
  };
};
