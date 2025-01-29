import { useGetPostById } from "@/utils/swr/dummy/useGetPostById";
import { Typography } from "@mui/material";
import { SetStateAction, useEffect } from "react";

type Props = {
  postId: string;
  setTitle: (value: SetStateAction<string>) => void;
};

export const TabContentA = ({ postId, setTitle }: Props) => {
  const { post, isLoading, error } = useGetPostById(postId);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
    } else {
      setTitle("");
    }
  }, [post]);

  if (error) return <div>{error.message}</div>;
  if (isLoading) return <div>ロード中</div>;
  if (!post) return <div>データ無し</div>;
  return (
    <div>
      <h2>タブAのコンテンツ</h2>
      <Typography>PostId: {post.id}</Typography>
      <Typography>UserId: {post.userId}</Typography>
      <Typography>Title: {post.title}</Typography>
    </div>
  );
};
