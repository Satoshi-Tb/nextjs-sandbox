import { useGridApiRef } from "@mui/x-data-grid";
import { useState } from "react";

const rawData = [
  { id: 1, category: "果物", item: "りんご" },
  { id: 2, category: "果物", item: "すいか" },
  { id: 3, category: "果物", item: "みかん" },
  { id: 4, category: "果物", item: "いちご" },
  { id: 5, category: "野菜", item: "なす" },
  { id: 6, category: "野菜", item: "きゅうり" },
  { id: 7, category: "野菜", item: "大根" },
  { id: 8, category: "野菜", item: "ごぼう" },
  { id: 9, category: "野菜", item: "キャベツ" },
  { id: 10, category: "野菜", item: "長ネギ" },
  { id: 11, category: "野菜", item: "玉ねぎ" },
  { id: 12, category: "野菜", item: "にんじん" },
];
const INITIAL_PAGE_SIZE = 5;
export const useGridSampleHooks = () => {
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);

  const gridApiRef = useGridApiRef();

  const processedData = rawData.map((data, index, arr) => {
    const isDuplicate =
      index !== 0 && data.category === arr[index - 1].category;
    const isFirstItemOfPage = index % pageSize === 0;
    let textColor;

    if (isFirstItemOfPage) {
      textColor = "black";
    } else {
      textColor = isDuplicate ? "white" : "black";
    }

    return {
      ...data,
      textColor,
    };
  });

  return {
    pageSize,
    setPageSize,
    gridApiRef,
    row: processedData,
  };
};
