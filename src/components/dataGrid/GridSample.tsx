import React, { useState, useCallback } from "react";
import {
  DataGrid,
  GridFilterModel,
  GridToolbar,
  gridExpandedSortedRowEntriesSelector,
  gridPaginatedVisibleSortedGridRowIdsSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import Link from "next/link";

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

export const GridSample = () => {
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);

  const apiRef = useGridApiRef();

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

  return (
    <div style={{ height: 400, width: "100%" }}>
      <button
        onClick={() => {
          // API REFの利用はDataGrid Pro以上のみ
          // const rows = gridExpandedSortedRowEntriesSelector(apiRef);
          // console.log("rows", rows);
        }}
      >
        gridPaginatedVisibleSortedGridRowIdsSelector
      </button>
      <DataGrid
        rows={processedData}
        slots={{ toolbar: GridToolbar }}
        initialState={{
          pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
        }}
        columns={[
          {
            field: "category",
            headerName: "分類名",
            width: 130,
            renderCell: (params) => (
              <div style={{ color: params.row.textColor }}>{params.value}</div>
            ),
          },
          {
            field: "item",
            headerName: "商品名",
            width: 130,
          },
        ]}
        pageSizeOptions={[5, 10, 25]}
        onPaginationModelChange={(model) => {
          console.log("onPaginationModelChange", model);
          setPageSize(model.pageSize);
        }}
        onFilterModelChange={(model) => {
          console.log("onFilterModelChange", model);
          console.log("rows", processedData);
        }}
      />
      {/* フッター */}
      <Link href="/">TOP</Link>
    </div>
  );
};
