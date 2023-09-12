import { useState, ChangeEvent } from "react";
import { useUser } from "./useUser";
import { setuid } from "process";

// トップレベルコンポーネント
export const SwrSample = () => {
  const [userId, setUserId] = useState("");
  const [key, setKey] = useState("");

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setUserId(event.target.value);
  };

  const handleClick = () => {
    setKey(userId);
  };

  // データをレンダリングする
  return (
    <>
      <Header userId={key} />
      <Content userId={key} />
      <input type="text" value={userId} onChange={handleInput} />
      <button onClick={handleClick}>更新</button>
    </>
  );
};

// 子コンポーネント1
type ContentProps = {
  userId: string;
};
const Content = ({ userId }: ContentProps) => {
  const { user, error: userError, isLoading: userLoading } = useUser(userId);

  if (userError) {
    return <div>failed to load</div>;
  }
  if (userLoading) return <div>loading...</div>;

  return <div>My name is {user.name}</div>;
};

// 子コンポーネント2
type HeaderProps = {
  userId: string;
};
const Header = ({ userId }: HeaderProps) => {
  const { user, error: userError, isLoading: userLoading } = useUser(userId);

  if (userError) {
    return <div>failed to load</div>;
  }
  if (userLoading) return <div>loading...</div>;

  return (
    <div>
      <h1>Welecome {user.name}&apos;s Page</h1>
      <hr />
    </div>
  );
};
