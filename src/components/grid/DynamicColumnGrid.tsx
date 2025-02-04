import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
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
      <Stack sx={{ height: 500, width: "50%", m: "10px" }} spacing={2}>
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
          loading={isLoading}
          slots={{ toolbar: GridToolbar }}
          columns={colums}
          hideFooterPagination={true}
          processRowUpdate={processRowUpdate}
          onCellEditStop={onCellEditStop}
        />
        {/* フッター */}
        <Link href="/">TOP</Link>
      </Stack>
    </div>
  );
};
