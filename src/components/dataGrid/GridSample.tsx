import React, { useState, useCallback, use, useRef } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Link from "next/link";
import { useGridSampleHooks } from "./GridSampleHooks";
import { Box, Button, Typography } from "@mui/material";

export const GridSample = () => {
  const {
    gridApiRef,
    pageSize,
    setPageSize,
    row,
    columns,
    filteredRowCount,
    filteredRowCountRef,
    handleUpdateFilteredRowsCount,
  } = useGridSampleHooks();

  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={{
        height: "100%",
      }}
    >
      <Box
        sx={{ height: 600, width: "80%" }}
        gap={1}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        <Link href="/">TOP</Link>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="body2" fontWeight="700">
            フィルタ後の表示件数
          </Typography>
          <Typography variant="body2">{filteredRowCount}</Typography>
          <Button
            variant="outlined"
            color="success"
            onClick={handleUpdateFilteredRowsCount}
          >
            フィルタ後の表示件数：最新化
          </Button>
          <Typography variant="body2">{filteredRowCountRef.current}</Typography>
        </Box>

        <DataGrid
          apiRef={gridApiRef}
          rows={row}
          slots={{ toolbar: GridToolbar }}
          columns={columns}
          pageSizeOptions={[5, 10, 25, 100]}
          onPaginationModelChange={(model) => {
            console.log("onPaginationModelChange", model);
            setPageSize(model.pageSize);
          }}
          onFilterModelChange={(model) => {
            // memo:ここで取得できるのは、変更後のフィルタモデルのみ。
            // フィルタ適用後の行情報は取得できないので注意
            console.log("onFilterModelChange", model);
            console.log("rows", row);
          }}
          sx={{ width: "100%" }}
        />
      </Box>
    </Box>
  );
};
