import React, { useEffect, useState } from "react";

export const ChildComponent = () => {
  const [message, setMessage] = useState("");
  const [parent, setParent] = useState<Window | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("handleMessage", event);
      // if (event.data === "Hello from parent") {
      //   event.source?.postMessage("Hello from child", "*");
      // }
      //setMessage(event.data);

      if ("key" in event.data && "message" in event.data) {
        setMessage(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    setParent(window.opener);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      <div>子コンポーネントです</div>
      <div>親コンポーネントからのメッセージ：{message}</div>
      <button
        onClick={() => {
          parent?.postMessage(
            { key: "parent", message: "Hello from sub window" },
            "*"
          );
        }}
      >
        親ウィンドウにメッセージを送る
      </button>
    </>
  );
};
