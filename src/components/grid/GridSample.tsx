import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const rawData = [
  { id: 1, category: "果物", item: "りんご" },
  { id: 2, category: "果物", item: "すいか" },
  { id: 3, category: "果物", item: "みかん" },
  { id: 4, category: "果物", item: "いちご" },
  { id: 5, category: "野菜", item: "なす" },
  { id: 6, category: "野菜", item: "きゅうり" },
  { id: 7, category: "野菜", item: "大根" },
];

let lastCategory = "";
const processedData = rawData.map((data) => {
  const isDuplicate = data.category === lastCategory;
  lastCategory = data.category;
  return {
    ...data,
    textColor: isDuplicate ? "white" : "black",
  };
});

export const GridSample = () => {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={processedData}
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
      />
    </div>
  );
};
