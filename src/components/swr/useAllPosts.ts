import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import type { Post } from "./types";

export const useAllPosts = () => {
  const { data, error, isLoading } = useSWR(
    "https://jsonplaceholder.typicode.com/posts",
    fetcher,
    {
      shouldRetryOnError: true, // エラー時の再試行を許可
      retryCount: 5, // 再試行の回数を指定
      retryDelay: 3000, // 再試行の間隔を3秒に設定
    }
  );
  const posts = data as Post[];
  return { posts, error, isLoading };
};
