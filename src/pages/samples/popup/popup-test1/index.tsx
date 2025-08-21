import React, { useEffect } from "react";

export default function Parent() {
  const childRef = React.useRef<Window | null>(null);

  // 子を開く（必要なら window.name を渡す）
  const openEditorPopup = () => {
    // NOTE: 近年のブラウザは a[target=_blank] だと既定でnoopener になることあり。
    // programmatic window.open では feature に 'noopener' を付けない（通信するため）
    childRef.current = window.open(
      "/samples/popup/popup-test1/child",
      "editor1",
      "width=900,height=700"
    );
  };

  const messageHandler = (ev: MessageEvent) => {
    if (ev.origin !== location.origin) return; // 同一オリジンだけ扱う
    const data = ev.data;
    if (data?.type === "LEAVE_CONFIRMED") {
      // ポップアップが閉じられたときの確認
      console.log("Popup left (confirmed):", data); // ここで Dirty をオフにする処理
      // updateUI(data.name, false) など
    }
  };

  useEffect(() => {
    console.log("親画面 ハンドラ登録");

    // コンポーネントのマウント時にイベントリスナーを追加
    window.addEventListener("message", messageHandler);

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => {
      console.log("親画面 ハンドラ解除");

      window.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "600px",
        margin: "20px auto",
      }}
    >
      <h1>Parent Window</h1>
      <p>This is the parent window that opens a popup.</p>
      <button
        onClick={() => {
          openEditorPopup();
        }}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Open Popup
      </button>
      <p style={{ marginTop: "20px" }}>
        Click the button to open a popup window. The popup will notify this
        parent window when it is closed or navigated away from.
      </p>
    </div>
  );
}
