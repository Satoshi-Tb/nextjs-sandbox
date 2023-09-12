import { useState, ChangeEvent, FormEvent } from "react";
import { useUser } from "./useUser";
import Link from "next/link";
import useSWRMutation from "swr/mutation";

async function sendRequest(
  url: any,
  { arg }: { arg: { user: string; email: string } }
) {
  return fetch(url, {
    method: "PATCH",
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

// トップレベルコンポーネント
export const SwrSample = () => {
  const [userId, setUserId] = useState("");
  const [key, setKey] = useState("");
  const [inName, setInName] = useState("");
  const [inEmail, setInEmail] = useState("");

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setUserId(event.target.value);
  };

  const handleClick = () => {
    setKey(userId);
  };

  const handleInputName = (event: ChangeEvent<HTMLInputElement>) => {
    setInName(event.target.value);
  };

  const handleInputEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setInEmail(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKey(userId);
    try {
      const result = await trigger({ user: "johndoe", email: "aaa@xyz" });
      if (result) {
        console.log("result: %o", result);
        alert("success!");
      } else {
        alert("ng!");
      }
    } catch (e) {
      // エラーハンドリング
      alert("error!");
      console.log("error: %o", e);
    }
  };

  const { trigger, isMutating } = useSWRMutation(
    `https://jsonplaceholder.typicode.com/users/${key}`,
    sendRequest
  );

  // データをレンダリングする
  return (
    <>
      <Header userId={key} />
      <Content userId={key} />
      <div
        style={{
          width: "20vh",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <input type="text" value={userId} onChange={handleInput} />
        <button onClick={handleClick}>検索</button>
      </div>
      <form style={{ marginTop: 10 }} onSubmit={handleSubmit}>
        <div>
          <label style={{ marginRight: 10 }}>name</label>
          <input
            style={{ marginRight: 10 }}
            type="text"
            value={inName}
            onChange={handleInputName}
          />
          <label style={{ marginRight: 10 }}>email</label>
          <input type="text" value={inEmail} onChange={handleInputEmail} />
        </div>

        <button type="submit" disabled={isMutating}>
          更新
        </button>
      </form>
      <Footer />
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

// 子コンポーネント3
const Footer = () => {
  return (
    <div>
      <hr />
      <Link href="/">Homeに戻る</Link>
    </div>
  );
};
