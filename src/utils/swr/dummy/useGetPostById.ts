import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import type { Post } from "./types";

export const useGetPostById = (id: string) => {
  const key = id
    ? `https://jsonplaceholder.typicode.com/posts/${id}`
    : undefined;

  console.log("swr key", key);
  const { data, error, isLoading } = useSWR(key, fetcher<Post>, {
    shouldRetryOnError: true, // エラー時の再試行を許可
    retryCount: 5, // 再試行の回数を指定
    retryDelay: 3000, // 再試行の間隔を3秒に設定
  });
  return { post: data, error, isLoading };
};
