import { FormDataResponse } from "@/pages/api/sample";
import { fetcher } from "@/utils/fetcher";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  use,
} from "react";
import TextInput from "./TextInput";

export type RowItem = { id: number; name: string; value?: string };

export default function FetchScrollFocusDemo() {
  console.log("Render: FetchScrollFocusDemo");

  const [rowItems, setRowItems] = useState<RowItem[]>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [inputErrors, setInputErrors] = useState<Record<number, string>>({});

  // フォーカスターゲット
  const targetId = useRef<number | null>(null);

  // 次のフォーカスターゲット
  const nextTargetId = useRef<number | null>(null);

  // スクロールコンテナ
  const containerRef = useRef<HTMLDivElement>(null);

  // 各行の input 要素を id => element で保持
  const inputRefs = useRef(new Map<number, HTMLInputElement>());

  // input 要素の参照を設定する関数
  // 注意：高階関数にすると毎回関数生成されるため、コンポーネントをmemo化しても毎回再生成されてしまう
  const setInputRefByName = useCallback((el: HTMLInputElement | null) => {
    const map = inputRefs.current;
    if (!el) return;
    const id = Number(el.getAttribute("name"));
    map.set(id, el);
  }, []);

  // 入力チェック
  const checkInput = (data: RowItem[]) => {
    const errors: Record<number, string> = {};
    data.forEach((item) => {
      if (!item.value || item.value.trim() === "") {
        errors[item.id] = `Item ${item.id} が未入力です`;
      }
    });
    return errors;
  };

  // データ取得関数
  const doLoadData = async () => {
    setError(""); // エラークリア
    setInputErrors({}); // 入力エラークリア
    targetId.current = null; // ターゲットIDクリア
    try {
      setLoading(true);
      // ダミーAPIアクセス。ウェイトあり
      const resp = await fetcher<FormDataResponse>("/api/sample");
      console.log("Data fetched successfully", { resp });
      setRowItems(resp.data ?? []);
    } catch (err) {
      console.log("Data fetched failed", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // 再表示ボタン押下処理
  const handleClickReloadButton = async () => {
    await doLoadData();
  };

  // データ更新関数
  const doUpdate = async (data: RowItem[]) => {
    console.log("update", { data });

    const response = await fetcher<FormDataResponse>("/api/sample", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // JSON形式で送信
    });
    if (!response || response.code !== "0000") {
      throw new Error("Invalid response from server", { cause: response });
    }
  };

  // フォーム送信時の処理
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = checkInput(rowItems);
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      targetId.current = Number(Object.keys(errors)[0]); // 最初のエラーをターゲットに設定
      alert("入力エラーがあります。確認してください。");
      return;
    } else {
      setInputErrors({}); // エラークリア
      targetId.current = null;
    }

    try {
      setUpdating(true);
      await doUpdate(rowItems);
      alert("データが更新されました！");
      await doLoadData(); // 再度データを取得して更新
      setError(""); // エラーをクリア
    } catch (err) {
      console.error("Update failed", err);
      alert("データの更新に失敗しました。");
      setError("Failed to update data");
    } finally {
      setUpdating(false);
    }
  };

  // フォーカスアウトの即時更新
  const handleFocusOut = useCallback(
    async (e: React.FocusEvent<HTMLInputElement, Element>) => {
      const newValue = e.target.value;
      const itemId = Number(e.target.getAttribute("name"));
      const nextTargetName =
        (e.relatedTarget as HTMLElement)?.getAttribute("name") ?? null;
      console.log("next", nextTargetName);
      nextTargetId.current = nextTargetName ? Number(nextTargetName) : null;

      try {
        setUpdating(true);
        await doUpdate([{ id: itemId, name: "", value: newValue }]);
        console.log("データ更新", { newValue });
        setError(""); // エラーをクリア
      } catch (err) {
        console.log("データ更新失敗", { newValue, err });
        setError("Failed to update data");
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  // フォーム編集時の処理
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const itemId = Number(e.target.getAttribute("name"));

      setRowItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, value: newValue } : item
        )
      );
    },
    []
  );

  // ① データ取得（疑似的に fetch）
  useEffect(() => {
    console.log("Effect: Fetching data");

    (async () => {
      await doLoadData();
    })();

    return () => {
      console.log("Cleanup: useEffect");
    };
  }, []);

  // ②→③ 入力エラー行にフォーカス
  useLayoutEffect(() => {
    console.log("Layout Effect: Scroll and focus", {
      loading,
      error,
      target: targetId.current,
    });
    if (loading && !error) return; // まだ描画されない
    if (targetId.current === null) return; // ターゲットがない

    const targetEl = inputRefs.current.get(targetId.current);
    if (!targetEl) return; // ターゲットがレンダ済みであること

    // 先にフォーカス（preventScroll対応ブラウザでジャンプ抑止）
    try {
      (targetEl as any).focus({ preventScroll: true });
    } catch {
      targetEl.focus(); // 古いブラウザ向けフォールバック
    }

    // スクロール：コンテナ中央へ配置
    // コンテナがある場合はコンテナ基準でスクロール
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = targetEl.getBoundingClientRect();
      const delta =
        elRect.top +
        elRect.height / 2 -
        (containerRect.top + containerRect.height / 2);
      container.scrollBy({ top: delta, left: 0, behavior: "auto" }); // 描画前なので auto でOK（チラつき防止）
    } else {
      // 画面全体スクロールの場合
      targetEl.scrollIntoView({ block: "center" });
    }

    // フォーカス情報クリア
    targetId.current = null;

    return () => {
      console.log("Cleanup: layout effect");
    };
  }, [loading, error, inputErrors, rowItems]);
  // items.length を依存に入れると「レンダリング済みか」を素朴に検出できます
  // targetId が props 由来で変わるケースにも対応

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: 500,
        }}
      >
        <h3>データフェッチ → 反映後にスクロール＆フォーカス</h3>

        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <form>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                style={{ marginTop: 16 }}
                onClick={handleClickReloadButton}
                disabled={loading}
              >
                データ取得
              </button>

              <button
                type="submit"
                style={{ marginTop: 16 }}
                onClick={handleOnSubmit}
                disabled={loading || updating}
              >
                更新
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div
                ref={containerRef}
                style={{
                  height: 280,
                  width: 400,
                  overflow: "auto",
                  border: "1px solid #ccc",
                  padding: 8,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 4px",
                    borderRadius: 6,
                  }}
                >
                  <label style={{ width: 64 }}>#text</label>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                    }}
                  >
                    <input
                      defaultValue={text}
                      name="0"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
                {rowItems.map((item) => {
                  return (
                    <TextInput
                      key={item.id}
                      item={item}
                      setInputRefByName={setInputRefByName}
                      handleOnChange={handleOnChange}
                      error={inputErrors[item.id]}
                      onBlur={handleFocusOut}
                    />
                  );
                })}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
