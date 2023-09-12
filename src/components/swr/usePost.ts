import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import type { Post } from "./types";

export const useAllPosts = (id: string) => {
  const { data, error, isLoading } = useSWR(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    fetcher,
    {
      shouldRetryOnError: true, // エラー時の再試行を許可
      retryCount: 5, // 再試行の回数を指定
      retryDelay: 3000, // 再試行の間隔を3秒に設定
    }
  );
  return { post: data as Post, error, isLoading };
};
