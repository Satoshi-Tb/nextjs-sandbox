import { Box, Switch } from "@mui/material";
import {
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridSingleSelectColDef,
  GridTreeNodeWithRender,
  useGridApiContext,
  useGridApiRef,
} from "@mui/x-data-grid";
import React, { useState } from "react";
import { useGetListWithColumnDefs } from "../swr/grid/useDynamicColumnData";

export type ColDefType = {
  fieldName: string;
  label: string;
  inputType: string;
  options?: OptItemType[];
};
type OptItemType = {
  optKey: string;
  optValue: string;
  optName: string;
};

type PartialGridColDef = Pick<
  GridColDef,
  | "field"
  | "headerName"
  | "editable"
  | "renderCell"
  | "type"
  | "renderEditCell"
  | "width"
> &
  Pick<GridSingleSelectColDef, "valueOptions">;

export const useDynamicColumnGridHooks = () => {
  const gridApiRef = useGridApiRef();

  const [testDataId, setTestDataId] = useState("1");

  const { data, isLoading, error } = useGetListWithColumnDefs(testDataId);
  const rows = data?.data.rowData ?? [];
  const dynamicColDefs = data?.data.colDefData ?? [];

  // カラム定義データから動的に定義生成
  const createDynamicColDef = (colDef: ColDefType): PartialGridColDef => {
    const propBase: { field: string; headerName: string; editable: boolean } = {
      field: colDef.fieldName,
      headerName: colDef.label,
      editable: true,
    };

    switch (colDef.inputType) {
      case "1":
        return {
          ...propBase,
        };
      case "2":
        return {
          ...propBase,
          type: "singleSelect",
          valueOptions:
            colDef.options?.map((opt) => ({
              value: opt.optValue,
              label: opt.optName,
            })) ?? [],
        };
      case "3":
        return {
          ...propBase,
          renderCell: renderSwitchCell,
          renderEditCell: renderEditingSwitchCell,
        };
      case "4":
        return {
          ...propBase,
          type: "boolean",
        };

      default:
        return {
          ...propBase,
        };
    }
  };

  /**
   * グリッドカラム定義
   */
  const colums: GridColDef[] = [
    // 固定項目
    {
      field: "category",
      headerName: "分類名",
      width: 130,
    },
    {
      field: "item",
      headerName: "商品名",
      width: 130,
    },
    // 動的項目
    ...dynamicColDefs.map<GridColDef>((def) => createDynamicColDef(def)),
  ];

  return {
    gridApiRef,
    rows,
    colums,
    isLoading,
    error,
    testDataId,
    setTestDataId,
  };
};

// カスタムセルレンダラー
// スイッチセル（表示用）
const renderSwitchCell = (
  param: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        lineHeight: "24px",
        color: "text.secondary",
      }}
    >
      <Switch checked={param.value === "1"} disabled={true} />
    </Box>
  );
};

// スイッチセル（編集用）
const renderEditingSwitchCell = (param: GridRenderEditCellParams) => {
  const { id, value, field } = param;

  const apiRef = useGridApiContext();

  const handleChange = async (event: any) => {
    /**
     * TODO:エンターキー押下で編集モードにした場合、スペースキーダウンでスイッチをトグルできない。
     * preventDefault, stopPropagation試したがダメ。
     * キーダウンを実装したが、それでもうまくいかず
     */
    await apiRef.current.setEditCellValue(
      { id, field, value: event.target.checked ? "1" : "0" },
      event
    );
    // 編集状態にした後、連続で切替動作をできるようにするため、stopEditは実施しない
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        lineHeight: "24px",
        color: "text.secondary",
        mr: 1,
      }}
    >
      <Switch checked={value === "1"} onChange={handleChange} />
    </Box>
  );
};
