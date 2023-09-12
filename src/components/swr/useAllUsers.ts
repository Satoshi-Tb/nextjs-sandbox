import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import type { User } from "./types";

export const useAllUsers = () => {
  const { data, error, isLoading } = useSWR(
    `https://jsonplaceholder.typicode.com/users`,
    fetcher
  );

  const users = data as User[];

  return {
    users,
    error,
    isLoading,
  };
};
