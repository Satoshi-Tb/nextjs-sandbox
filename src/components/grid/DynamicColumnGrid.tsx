import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
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
    error,
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
            <MenuItem value={"3"}>DataSet:3</MenuItem>
          </Select>
        </FormControl>
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
      </Stack>
    </div>
  );
};
