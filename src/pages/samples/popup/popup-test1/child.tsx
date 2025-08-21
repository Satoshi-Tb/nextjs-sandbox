import React, { useEffect } from "react";

export default function Child() {
  const dirtyFlgRef = React.useRef<boolean>(false);

  // 親へ Dirty 状態を伝える（ベストエフォートで複数経路）
  const notifyParentLeaveConfirmed = () => {
    const payload = {
      type: "LEAVE_CONFIRMED",
      dirty: dirtyFlgRef.current,
      name: window.name,
      ts: Date.now(),
    };

    if (window.opener) {
      console.log("Sending message to opener:", payload);
      // セキュリティのため origin を明示（同一オリジンなら location.origin）
      window.opener.postMessage(payload, location.origin);
    }
  };

  // ページアンロード前の処理
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!dirtyFlgRef.current) return;
    console.log("Dirty state detected, notifying parent...");
    // 空文字をセットすると標準の確認ダイアログが表示される
    e.preventDefault();
  };

  // ページ遷移確定時の処理
  const handlePageHide = (e: PageTransitionEvent) => {
    if (!dirtyFlgRef.current) return;
    dirtyFlgRef.current = false; // 自分の Dirty も落としておく（任意）
    notifyParentLeaveConfirmed();
  };

  useEffect(() => {
    console.log("子ダイアログ ハンドラ登録");
    // beforeunload イベントで Dirty 状態を確認
    window.addEventListener("beforeunload", handleBeforeUnload);
    // ページ遷移時に Dirty 状態を親へ通知
    window.addEventListener("pagehide", handlePageHide);

    // クリーンアップ
    return () => {
      console.log("子ダイアログ ハンドラ解除");

      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return (
    <div>
      <h1>子ダイアログ</h1>
      <p>This is a popup child window.</p>
      <button
        onClick={() => {
          dirtyFlgRef.current = !dirtyFlgRef.current; // Dirty 状態をトグル
          alert(`Dirty state is now: ${dirtyFlgRef.current}`);
          // 親へ Dirty 状態
        }}
      >
        Set Dirty State
      </button>
      <button
        onClick={() => {
          window.close(); // ポップアップを閉じる
        }}
      >
        Close Popup
      </button>
    </div>
  );
}
