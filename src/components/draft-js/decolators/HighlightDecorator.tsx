import { ContentBlock, ContentState, CompositeDecorator } from "draft-js";

function findWithRegex(
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
) {
  const text = contentBlock.getText();
  let matchArr: RegExpExecArray | null, start: number;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

type HighlightSpanProps = {
  children: React.ReactNode;
};

const HighlightSpan = ({ children }: HighlightSpanProps) => (
  <span style={{ backgroundColor: "yellow" }}>{children}</span>
);

export const createHighlightDecorator = (searchKeyword: string) =>
  new CompositeDecorator([
    {
      strategy: (
        contentBlock: ContentBlock,
        callback: (start: number, end: number) => void,
        contentState: ContentState
      ) => {
        if (searchKeyword) {
          findWithRegex(new RegExp(searchKeyword, "g"), contentBlock, callback);
        }
      },
      component: HighlightSpan,
    },
  ]);
