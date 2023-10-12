import { useState, ChangeEvent, FormEvent } from "react";
import { useUser } from "./useUser";
import Link from "next/link";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";

async function sendRequest(
  url: any,
  { arg }: { arg: { user: string; email: string } }
) {
  const res = await fetch(url, { method: "PATCH", body: JSON.stringify(arg) });

  // レスポンスをパースして投げようとします。
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }

  return res.json();
}

async function updateUser(arg: { user: string; email: string }) {
  console.log("update! user=%o, email=%o", arg.user, arg.email);
}

// トップレベルコンポーネント
export const SwrSample = () => {
  const [inUserId, setInUserId] = useState("");
  const [key, setKey] = useState("");
  const [inName, setInName] = useState("");
  const [inEmail, setInEmail] = useState("");
  const [inName2, setInName2] = useState("");
  const [inEmail2, setInEmail2] = useState("");

  // フォーム１　イベントハンドラー
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setInUserId(event.target.value);
  };

  const handleClick = () => {
    setKey(inUserId);
  };

  const handleInputName = (event: ChangeEvent<HTMLInputElement>) => {
    setInName(event.target.value);
  };

  const handleInputEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setInEmail(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inUserId === "" || inName === "" || inEmail === "") {
      alert("ユーザーID、または名前、またはemailが未入力です");
      return;
    }

    setKey(inUserId);
    try {
      //TODO ローカルキャッシュ書き換えしているか？
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

  // フォーム２ハンドラー
  const { mutate } = useSWRConfig(); // mutator準備
  const handleInputName2 = (event: ChangeEvent<HTMLInputElement>) => {
    setInName2(event.target.value);
  };

  const handleInputEmail2 = (event: ChangeEvent<HTMLInputElement>) => {
    setInEmail2(event.target.value);
  };

  const handleSubmit2 = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // update emulation
    await updateUser({ user: inName2, email: inEmail2 });
    const userUserKey = `https://jsonplaceholder.typicode.com/users/${key}`;
    console.log("upduserUserKey:%o", userUserKey);
    mutate(userUserKey);
  };

  // データをレンダリングする
  return (
    <>
      <Header userId={key} />
      <Content userId={key} />
      <div>
        <input
          type="text"
          value={inUserId}
          onChange={handleInput}
          style={{ marginRight: 10 }}
        />
        <button onClick={handleClick}>検索</button>
      </div>

      <form style={{ marginTop: 10 }} onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 10 }}>
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
            更新（SWRMutation）
          </button>
        </div>
      </form>

      <form style={{ marginTop: 10 }} onSubmit={handleSubmit2}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 10 }}>
            <label style={{ marginRight: 10 }}>name</label>
            <input
              style={{ marginRight: 10 }}
              type="text"
              value={inName2}
              onChange={handleInputName2}
            />
            <label style={{ marginRight: 10 }}>email</label>
            <input type="text" value={inEmail2} onChange={handleInputEmail2} />
          </div>

          <button type="submit" disabled={false}>
            更新（SWR & mutate）
          </button>
        </div>
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
