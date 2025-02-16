import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import Link from "next/link";
import {
  RowDataType,
  useDynamicColumnGridHooks,
} from "./DynamicCloumnGridHooks";

/**
 * グリッド画面
 * @returns
 */
export const DynamicColumnGrid = () => {
  const {
    gridApiRef,
    rows,
    isLoading,
    colums,
    testDataId,
    setTestDataId,
    processRowUpdate,
    onCellEditStop,
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
      <Stack sx={{ height: 800, width: "50%", m: "10px" }} spacing={2}>
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
          </Select>
        </FormControl>
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
          onRowSelectionModelChange={(params) => {
            console.log("onRowSelectionModelChange", params);
          }}
          checkboxSelection={true}
          disableRowSelectionOnClick={true}
          onStateChange={(params) => {
            console.log("onStateChange", params);
          }}
        />
        {/* フッター */}
        <Link href="/">TOP</Link>
        <TestHorizontalScrollContainer />
        <div
          style={{
            width: "fit-content",
            background: "lightblue",
            border: "1px solid black",
          }}
        >
          <span>Hello </span>
          <span>World</span>
        </div>
        <div
          style={{
            width: "fit-content",
            background: "lightblue",
            border: "1px solid black",
          }}
        >
          <div style={{ display: "inline" }}>Hello </div>
          <div style={{ display: "inline" }}>World</div>
        </div>
        <div
          style={{
            width: "fit-content",
            background: "lightblue",
            border: "1px solid black",
          }}
        >
          <input type="radio" />
          <label>Radio1</label>
          <input type="radio" />
          <label>Radio2</label>
        </div>
        <div
          style={{
            width: "100px",
            overflowX: "auto",
            border: "1px solid red",
            padding: "5px",
          }}
        >
          <div
            style={{
              width: "fit-content",
              background: "lightblue",
              whiteSpace: "nowrap",
              border: "1px solid black",
            }}
          >
            <input type="radio" />
            <label>Radio1</label>
            <input type="radio" />
            <label>Radio2</label>
          </div>
        </div>
      </Stack>
    </div>
  );
};

const TestHorizontalScrollContainer = () => {
  return (
    <Box
      sx={{
        display: "flex", // 子要素を横並びにする
        overflowX: "auto", // 横スクロールを有効化
        whiteSpace: "nowrap", // 折り返しを防ぐ
        width: "100%", // 親要素の幅を100%に
        border: "1px solid gray", // 視認しやすくするための枠線
      }}
    >
      {/* 子要素 (複数の Box) */}
      {[...Array(10)].map((_, index) => (
        <Box
          key={index}
          sx={{
            minWidth: "150px", // 子要素の最小幅
            height: "100px", // 高さを統一
            backgroundColor: "lightblue",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 8px", // 余白を追加
          }}
        >
          Item {index + 1}
        </Box>
      ))}
    </Box>
  );
};
