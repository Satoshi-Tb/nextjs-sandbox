import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Stack, Switch } from "@mui/material";
import Link from "next/link";
import { useDynamicColumnGridHooks } from "./DynamicCloumnGridHooks";

/**
 * グリッド画面
 * @returns
 */
export const DynamicColumnGrid = () => {
  const { gridApiRef, rows, isLoading, colums } = useDynamicColumnGridHooks();
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
        <DataGrid
          apiRef={gridApiRef}
          rows={rows}
          loading={isLoading}
          slots={{ toolbar: GridToolbar }}
          columns={colums}
        />
        <Link href="/">TOP</Link>
      </Stack>
    </div>
  );
};
