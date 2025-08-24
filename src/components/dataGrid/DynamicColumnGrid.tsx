import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useDynamicColumnGridHooks } from "./DynamicCloumnGridHooks";

/**
 * グリッド画面
 * @returns
 */
export const DynamicColumnGrid = () => {
  const {
    gridApiRef,
    rows,
    isLoading,
    error,
    colums,
    testDataId,
    setTestDataId,
    processRowUpdate,
    onCellEditStop,
    handleCheckInput,
    rowSelectionModel,
    handleRowSelectionModelChange,
    requiredErrorInfo,
    columnHeaderStyles,
  } = useDynamicColumnGridHooks();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack sx={{ height: 500, width: "50%", m: "10px" }} spacing={2}>
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          {/* データセットセレクト */}
          <FormControl sx={{ m: 1, width: 150 }} size="small">
            <InputLabel id="demo-select-small-label">サンプルデータ</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={testDataId}
              label="testDataSet"
              onChange={(event) => setTestDataId(event.target.value)}
            >
              <MenuItem value={"1"}>DataSet:1</MenuItem>
              <MenuItem value={"2"}>DataSet:2</MenuItem>
              <MenuItem value={"3"}>DataSet:3</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={handleCheckInput}>
            入力チェック
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              gridApiRef.current?.setFilterModel({
                items: [],
                quickFilterValues: [],
              });
            }}
          >
            フィルター解除
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const rowCount = gridApiRef.current?.getRowsCount();
              if (rowCount !== undefined) {
                gridApiRef.current?.scrollToIndexes({ rowIndex: rowCount - 1 });
              }
            }}
          >
            スクロール位置を最後尾に移動
          </Button>
        </Stack>
        {error && (
          <Typography variant="body1" sx={{ color: "red", fontWeight: "bold" }}>
            {error.message}
          </Typography>
        )}
        {/* 一覧 */}
        <DataGrid
          apiRef={gridApiRef}
          rows={rows}
          rowHeight={80}
          loading={isLoading}
          slots={{ toolbar: GridToolbar }}
          columns={colums}
          hideFooterPagination={true}
          processRowUpdate={processRowUpdate}
          onRowEditCommit={(params) => {
            console.log("onRowEditCommit", params);
          }}
          onCellEditStop={onCellEditStop}
          onFilterModelChange={(params) => {
            console.log("onFilterModelChange", params);
          }}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          checkboxSelection={true}
          disableRowSelectionOnClick={true}
          onStateChange={(params) => {
            // console.log("onStateChange", params);
          }}
          sx={{
            "& .MuiDataGrid-row.input-error": {
              backgroundColor: "hsla(0, 100.00%, 50.00%, 0.50)", // エラー行の色
            },
            ...columnHeaderStyles, // カラムヘッダー色
          }}
          getRowClassName={(params) => {
            // console.log("getRowClassName", requiredErrorInfo);
            return requiredErrorInfo.find((info) => info.id === params.id)
              ? "input-error"
              : "";
          }}
        />
        {/* フッター */}
        <Link href="/">TOP</Link>
      </Stack>
    </div>
  );
};
