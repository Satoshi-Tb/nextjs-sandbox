import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { User } from "./types";
export const useGetUserById = (id: string) => {
  const key = id ?? undefined;

  const { data, error, isLoading } = useSWR(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    fetcher<User>
  );

  return {
    user: data,
    error,
    isLoading,
  };
};
