import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { User } from "./types";
export const useUser = (id: string) => {
  const key = id ?? undefined;

  const { data, error, isLoading } = useSWR(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    fetcher
  );

  return {
    user: data as User,
    error,
    isLoading,
  };
};
