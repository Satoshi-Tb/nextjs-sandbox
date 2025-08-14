import React, { useEffect, useState } from "react";
import { RowItem } from ".";

type TextInputProps = {
  item: RowItem;
  setInputRefByName: (el: HTMLInputElement | null) => void;
  handleOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
  error?: string;
};

const TextInput = ({
  item,
  setInputRefByName,
  handleOnChange,
  onFocus,
  onBlur,
  error,
}: TextInputProps) => {
  console.log("Render: TextInput");

  //   useEffect(() => {
  //     console.log("マウント: TextInput");

  //     return () => {
  //       console.log("破棄: TextInput");
  //     };
  //   }, []);

  useEffect(() => {
    console.log("Effect: TextInput", { item });

    return () => {
      console.log("Cleanup: TextInput", { item });
    };
  }, [item]);

  // whyDidYouRender動作確認のための、テスト用状態
  const [objState, setObjState] = useState({ name: "World" });

  useEffect(() => {
    setObjState({ name: "World" });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: "4px 4px",
        borderRadius: 6,
      }}
    >
      <label style={{ width: 64 }}>#{item.id}</label>
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <input
          ref={setInputRefByName}
          name={item.id.toString()}
          value={item.value}
          onChange={handleOnChange}
          style={{
            flex: 1,
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: 6,
            outline: error ? "4px solid #e91e6399" : "none",
          }}
          aria-label={`Item ${item.id}`}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {error && <label style={{ color: "red" }}>{error}</label>}
      </div>
      {objState && (
        <div style={{ marginLeft: 8 }}>
          <span>objState: {objState.name}</span>
        </div>
      )}
    </div>
  );
};

TextInput.displayName = "TextInput"; // React.memoでラップしたコンポーネントの名前を設定

// WDYRのためのコンポーネント定義
TextInput.whyDidYouRender = true;

export default React.memo(TextInput);
