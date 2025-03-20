import {
  gridExpandedSortedRowEntriesSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";

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
  const [filteredRowCount, setFilteredRowCount] = useState(0);

  const gridApiRef = useGridApiRef();

  // useRefのテスト。useState版との比較のため、サンプル実装
  // フィルタ後の行数を格納する。
  // 本来はuseStateを利用して、適切に再レンダリングを促すのが正しい実装。
  const filteredRowCountRef = useRef(0);
  // 強制再レンダリング用のトリガー。利用方法としては適切ではない。
  const [, forceUpdateState] = useState({});

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

  const handleUpdateFilteredRowsCount = () => {
    const rows = gridExpandedSortedRowEntriesSelector(
      gridApiRef.current.state,
      gridApiRef.current.instanceId
    );
    filteredRowCountRef.current = rows.length;
    // 強制再レンダリング。これを実施しないと、描画内容が変化しない。
    forceUpdateState({});
  };

  useEffect(() => {
    const updateFilteredRowCount = () => {
      console.log("new filter applyed");
      if (gridApiRef.current) {
        const rows = gridExpandedSortedRowEntriesSelector(
          gridApiRef.current.state,
          gridApiRef.current.instanceId
        );
        setFilteredRowCount(rows.length);
      }
    };
    // 初期表示時
    updateFilteredRowCount();

    // フィルター変更時
    const unsubscribe = gridApiRef.current.subscribeEvent(
      "filteredRowsSet",
      updateFilteredRowCount
    );
    return () => {
      unsubscribe();
    };
  }, [gridApiRef]);

  return {
    pageSize,
    setPageSize,
    gridApiRef,
    row: processedData,
    filteredRowCount,
    filteredRowCountRef,
    handleUpdateFilteredRowsCount,
  };
};
