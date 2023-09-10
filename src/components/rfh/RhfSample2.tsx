import { useState } from "react";
import Link from "next/link";
import styles from "./RhfSample1.module.css";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";

interface LoginForm {
  name: string;
  email: string;
  password: string;
}

export const RhfSample2 = () => {
  //react-hook-formを利用する
  //非制御コンポーネント
  //useState不要

  //validationはサブミットで発火
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ mode: "onSubmit" });

  // サブミットハンドラ（validationエラーなし）
  const onSubmitValid: SubmitHandler<LoginForm> = (data) => {
    alert(
      "do submit!\n" +
        `name:${data.name} email:${data.email} password:${data.password}`
    );
  };

  // サブミットハンドラ（validationエラーあり）
  const onSubmitInvalid: SubmitErrorHandler<LoginForm> = (errors) => {
    console.log(errors);
  };

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.formContainer}>
        <h1>ログインフォーム（react-hook-form, 非制御コンポーネント）</h1>
        <form onSubmit={handleSubmit(onSubmitValid, onSubmitInvalid)}>
          <label htmlFor="名前">名前</label>
          <input
            type="text"
            {...register("name", {
              required: "名前は必須です",
              minLength: { value: 4, message: "4文字以上で入力してください。" },
            })}
          />
          <p>{errors.name?.message as React.ReactNode}</p>

          <label htmlFor="メールアドレス">メールアドレス</label>
          <input
            type="email"
            {...register("email", { required: "メールアドレスは必須です" })}
          />
          <p>{errors.email?.message as React.ReactNode}</p>

          <label htmlFor="パスワード">パスワード</label>
          <input
            type="password"
            {...register("password", {
              required: "パスワードは必須です",
              minLength: { value: 6, message: "6文字以上で入力してください。" },
            })}
          />
          <p>{errors.password?.message as React.ReactNode}</p>

          <button type="submit">送信</button>
        </form>
      </div>
      <div style={{ marginTop: "20px" }}>
        <Link href="/">Homeに戻る</Link>
      </div>
    </div>
  );
};
