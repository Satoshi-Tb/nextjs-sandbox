import { useState } from "react";

interface Color {
  color: string;
  name: string;
}

type Props = {
  index: number;
  setKeyword: (index: number, kewd: string) => void;
  setHighlight: (index: number, color: string) => void;
};

const ColorList: Color[] = [
  { color: "yellow", name: "黄色" },
  { color: "lime", name: "緑色" },
  { color: "red", name: "赤色" },
];

const KeywordHighlighter = ({ index, setKeyword, setHighlight }: Props) => {
  const [color, setColor] = useState("yellow");
  const [keywd, setKeywd] = useState("");

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywd((prev) => event.target.value);
    setKeyword(index, event.target.value);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColor((prev) => event.target.value);
    setHighlight(index, event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="検索キーワード"
        value={keywd}
        onChange={handleInput}
        style={{ marginRight: "5px" }}
      />
      <select value={color} onChange={handleSelectChange}>
        {ColorList.map((c) => (
          <option value={c.color} key={c.color}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default KeywordHighlighter;
