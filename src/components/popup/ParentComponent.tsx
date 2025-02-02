import envConfig from "@/utils/envConfig";
import React, { useEffect, useState } from "react";

export const ParentComponent: React.FC = () => {
  const [child, setChild] = useState<Window | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("handleMessage", event);
      if ("key" in event.data && "message" in event.data) {
        setMessage(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const openChildWindow = () => {
    const w = window.open(
      `${envConfig.apiUrl}/samples/popup/child`,
      "Child Window",
      "width=600,height=400"
    );
    setChild(w);
  };

  const sendMessage = () => {
    child?.postMessage(
      { key: "child", message: "Hello from main window" },
      "*"
    );
  };

  return (
    <div>
      <button onClick={openChildWindow}>子ウィンドウを開く</button>
      <button onClick={sendMessage}>子ウィンドウにメッセージを送る</button>
      <div>サブウィンドウから：{message}</div>
    </div>
  );
};
