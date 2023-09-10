import { useState } from "react";
import Link from "next/link";
import styles from "./RhfSample1.module.css";

export const RhfSample1 = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //制御コンポーネントのデメリット
  //入力するたびに render されるので重い
  //特にコンポーネントツリーの上位にあると下位コンポーネントも再レンダーしてしまう

  // 入力イベントハンドラ
  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleInputEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleInputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // サブミットハンドラ
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //制御コンポーネントであれば、preventDefault不要
    //event.preventDefault();
    alert("do submit!\n" + `name:${name} email:${email} password:${password}`);
  };

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.formContainer}>
        <h1>ログインフォーム（plain react, 制御コンポーネント）</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="名前">名前</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleInputName}
          />
          <label htmlFor="メールアドレス">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleInputEmail}
          />
          <label htmlFor="パスワード">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handleInputPassword}
          />
          <button type="submit">送信</button>
        </form>
      </div>
      <div style={{ marginTop: "20px" }}>
        <Link href="/">Homeに戻る</Link>
      </div>
    </div>
  );
};
