import { useTabSampleUserIdState } from "@/store/useTabSampleUserIdState";
import { useGetUserById } from "@/utils/swr/dummy/useGetUserById";
import { Typography } from "@mui/material";
import { SetStateAction, useEffect } from "react";

type Props = {
  setUserName: (value: SetStateAction<string>) => void;
};

export const TabContentC = ({ setUserName }: Props) => {
  const userId = useTabSampleUserIdState();
  const { user, isLoading, error } = useGetUserById(userId);

  useEffect(() => {
    if (user) {
      setUserName(user.username);
    } else {
      setUserName("");
    }
  }, [user]);

  if (error) return <div>{error.message}</div>;
  if (isLoading) return <div>ロード中</div>;
  if (!user) return <div>データ無し</div>;
  return (
    <div>
      <h2>タブCのコンテンツ</h2>
      <Typography>UserId: {user.id}</Typography>
      <Typography>UserName: {user.username}</Typography>
      <Typography>Phone: {user.phone}</Typography>
    </div>
  );
};
