import { Box, Switch } from "@mui/material";
import {
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridSingleSelectColDef,
  GridTreeNodeWithRender,
  GridValueGetterParams,
  GridValueSetterParams,
  useGridApiContext,
  useGridApiRef,
} from "@mui/x-data-grid";
import React, { useState } from "react";
import { useGetListWithColumnDefs } from "../swr/grid/useDynamicColumnData";

export type ColDefType = {
  gridFieldName: string;
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

export type RowDataType = {
  id: number;
  category: string;
  item: string;
  freeItems: FreeItemType[];
};

export type FreeItemType = {
  id: number;
  gridFieldName: string;
  fieldName: string;
  value: string;
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
  | "valueGetter"
  | "valueSetter"
> &
  Pick<GridSingleSelectColDef, "valueOptions">;

export const useDynamicColumnGridHooks = () => {
  const gridApiRef = useGridApiRef();

  const [testDataId, setTestDataId] = useState("1");

  const { data, isLoading, error } = useGetListWithColumnDefs(testDataId);
  const rows = data?.data.rowData ?? [];
  const dynamicColDefs = data?.data.colDefData ?? [];

  // カラム定義データから動的に定義生成
  // TODO データ構造が複雑なので、レンダリングパフォーマンス懸念
  // TODO カスタムセル定義の実装難易度に影響（valueの取り方）
  const createDynamicColDef = (colDef: ColDefType): PartialGridColDef => {
    // 共通カラム定義設定
    const propBase: PartialGridColDef = {
      field: colDef.gridFieldName,
      headerName: colDef.label,
      editable: true,
      valueGetter: (params: GridValueGetterParams<RowDataType, string>) =>
        params.row.freeItems.find(
          (f) => f.gridFieldName === colDef.gridFieldName
        )?.value || "",
      valueSetter: (params: GridValueSetterParams<RowDataType, string>) => {
        // 編集時に freeItems の該当する項目を更新
        return {
          ...params.row,
          freeItems: params.row.freeItems.map((f) =>
            f.gridFieldName === colDef.gridFieldName
              ? { ...f, value: params.value }
              : f
          ),
        };
      },
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
