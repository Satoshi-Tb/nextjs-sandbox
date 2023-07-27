import { ComponentProps, FC } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { AutoFocusPlugin } from "@/pages/samples/rich-editor/plugins/AutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

const initialConfig: ComponentProps<typeof LexicalComposer>["initialConfig"] = {
  namespace: "MyEditor",
  onError: (error) => console.error(error),
};

export default function Editor(): JSX.Element {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        style={{
          position: "relative",
          padding: "24px",
          minHeight: "240px",
          background: "white",
          border: "1px solid black",
          borderRadius: "10px",
          margin: "5px",
        }}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable style={{ outline: "none" }} />}
          placeholder={
            <div
              style={{
                position: "absolute",
                color: "#888888",
                top: "24px",
                left: "24px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              いまなにしてる？
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <AutoFocusPlugin />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
