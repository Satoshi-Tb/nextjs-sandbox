import Link from "next/link";
import styles from "./RhfSample1.module.css";
import { useForm, SubmitHandler, SubmitErrorHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface LoginForm {
  name: string;
  email: string;
  password: string;
}

export const RhfSample3 = () => {
  //react-hook-formを利用する
  //非制御コンポーネント

  /**
   * zodバリデーションスキーマの定義
   */
  const validationSchema = z.object({
    name: z
      .string()
      .nonempty("名前は必須です。")
      .min(4, "名前は4文字以上で入力してください。"),
    email: z
      .string()
      .nonempty("メールアドレスは必須です。")
      .email("正しいメールアドレスを入力してください。"),
    password: z
      .string()
      .nonempty("パスワードは必須です。")
      .min(6, "名前は6文字以上で入力してください。"),
  });

  /**
   * react-hook-form
   *
   */
  //validationはサブミットで発火
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: "onSubmit",
    resolver: zodResolver(validationSchema),
  });

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
        <h1>
          ログインフォーム（react-hook-form, 非制御コンポーネント,
          バリデーションにzod使用）
        </h1>
        <form onSubmit={handleSubmit(onSubmitValid, onSubmitInvalid)}>
          <label htmlFor="名前">名前</label>
          <input type="text" {...register("name")} />
          <p>{errors.name?.message as React.ReactNode}</p>

          <label htmlFor="メールアドレス">メールアドレス</label>
          <input type="text" {...register("email")} />
          <p>{errors.email?.message as React.ReactNode}</p>

          <label htmlFor="パスワード">パスワード</label>
          <input type="password" {...register("password")} />
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
