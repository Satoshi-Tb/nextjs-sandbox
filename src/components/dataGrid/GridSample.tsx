import React, { useState, useCallback, use, useRef } from "react";
import {
  DataGrid,
  GridToolbar,
  gridExpandedSortedRowEntriesSelector,
} from "@mui/x-data-grid";
import Link from "next/link";
import { useGridSampleHooks } from "./GridSampleHooks";
import { Box, Button, Typography } from "@mui/material";

export const GridSample = () => {
  // useRefのテスト。フィルタ後の行数を格納する。
  // 本来はuseStateを利用して、適切に再レンダリングを促すのが正しい実装。
  const filteredRowCountRef = useRef(0);
  // 強制再レンダリング用のトリガー。利用方法としては適切ではない。
  const [, forceUpdate] = useState({});

  const { gridApiRef, pageSize, setPageSize, row } = useGridSampleHooks();

  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={{
        height: "100%",
      }}
    >
      <Box
        sx={{ height: 400, width: "80%" }}
        gap={1}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        <Link href="/">TOP</Link>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              const rows = gridExpandedSortedRowEntriesSelector(gridApiRef);
              filteredRowCountRef.current = rows.length;
              // 強制再レンダリング。これを実施しないと、描画内容が変化しない。
              forceUpdate({});
            }}
          >
            フィルタ後の表示件数：最新化
          </Button>
          <Typography variant="body2" alignContent="center">
            {filteredRowCountRef.current}
          </Typography>
        </Box>

        <DataGrid
          apiRef={gridApiRef}
          rows={row}
          slots={{ toolbar: GridToolbar }}
          columns={[
            {
              field: "category",
              headerName: "分類名",
              width: 130,
              renderCell: (params) => (
                <div style={{ color: params.row.textColor }}>
                  {params.value}
                </div>
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
            console.log("rows", row);
          }}
          sx={{ width: "100%" }}
        />
      </Box>
    </Box>
  );
};
