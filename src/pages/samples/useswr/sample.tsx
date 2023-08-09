import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { useUser } from "@/hooks/useUser";
import { json } from "stream/consumers";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

function Profile() {
  const { data, error, isLoading } = useSWR(
    "https://jsonplaceholder.typicode.com/postss",
    fetcher,
    {
      shouldRetryOnError: true, // エラー時の再試行を許可
      retryCount: 5, // 再試行の回数を指定
      retryDelay: 3000, // 再試行の間隔を3秒に設定
    }
  );

  const { user: uData, isError: uError, isLoading: uIsLoading } = useUser("1");

  console.log(error);
  //console.log(uError);

  if (error || uError) {
    return <div>failed to load</div>;
  }
  if (isLoading || uIsLoading) return <div>loading...</div>;

  //console.log(data);
  //console.log(uData);
  const jData = data as Post[];
  const user = uData as User;
  // データをレンダリングする
  return <div>hello {user.name}!</div>;
}

export default Profile;
