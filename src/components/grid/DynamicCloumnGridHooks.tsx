import { Box, MenuItem, Select, Switch } from "@mui/material";
import {
  GridCellParams,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  selectItem: string;
  detailItems: {
    id: number;
    gridFieldName: string;
    fieldName: string;
    value: string;
  }[];
};

type SelectItemType = "1" | "2" | "3" | "4" | "5" | "";

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

  // 編集後の列名
  const [editedField, setEditedField] = useState<string | null>(null);

  // 選択項目の状態管理
  const [selectItemState, setSelectItemState] = useState<{
    [rowId: string]: SelectItemType;
  }>({});

  const { data, isLoading, error } = useGetListWithColumnDefs(testDataId);
  const rows = useMemo(() => data?.data.rowData ?? [], [data]);

  // 初期値設定
  useEffect(() => {
    if (rows.length > 0) {
      // 選択項目の初期値設定
      const initialSelectItemState = rows.reduce<{
        [rowId: string]: SelectItemType;
      }>((acc, row) => {
        acc[row.id] = row.selectItem as SelectItemType;
        return acc;
      }, {});
      setSelectItemState(initialSelectItemState);
    }
  }, [rows]);

  const dynamicColDefs = useMemo(() => data?.data.colDefData ?? [], [data]);

  // カラム定義データから動的に定義生成
  // TODO データ構造が複雑なので、レンダリングパフォーマンス懸念
  // TODO カスタムセル定義の実装難易度に影響（valueの取り方）
  const createDynamicColumnDefs = useCallback(
    (colDef: ColDefType): PartialGridColDef => {
      // 共通カラム定義設定
      const baseDef: PartialGridColDef = {
        field: colDef.gridFieldName,
        headerName: colDef.label,
        valueGetter: (params: GridValueGetterParams<RowDataType, string>) =>
          params.row.detailItems.find(
            (f) => f.gridFieldName === colDef.gridFieldName
          )?.value || "",
        valueSetter: (params: GridValueSetterParams<RowDataType, string>) => {
          // 編集時に freeItems の該当する項目を更新
          return {
            ...params.row,
            detailItems: params.row.detailItems.map((f) =>
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
            ...baseDef,
            editable: true,
          };
        case "2":
          return {
            ...baseDef,
            type: "singleSelect",
            valueOptions:
              colDef.options?.map((opt) => ({
                value: opt.optValue,
                label: opt.optName,
              })) ?? [],
          };
        case "3":
          return {
            ...baseDef,
            renderCell: renderSwitchCell,
            renderEditCell: renderEditingSwitchCell,
          };
        case "4":
          return {
            ...baseDef,
            type: "boolean",
          };

        default:
          return {
            ...baseDef,
          };
      }
    },
    []
  );

  /**
   * グリッドカラム定義
   */
  const colums = useMemo<GridColDef[]>(() => {
    console.log("colums defition 再計算");

    // 固定項目
    const fixedColDefs: GridColDef[] = [
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
      {
        field: "selectItem",
        headerName: "選択項目",
        width: 130,
        renderCell: (param: GridRenderCellParams<RowDataType, string>) => {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Select
                value={selectItemState[param.id] || ""}
                onChange={(event) => {
                  setSelectItemState({
                    ...selectItemState,
                    [param.id]: event.target.value as SelectItemType,
                  });
                  console.log("changeItemState", {
                    targetRow: param.id,
                    targetValue: event.target.value,
                  });
                }}
                displayEmpty={true}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value="">
                  <em>選択なし</em>
                </MenuItem>
                <MenuItem value="1">選択値1</MenuItem>
                <MenuItem value="2">選択値2</MenuItem>
                <MenuItem value="3">選択値3</MenuItem>
                <MenuItem value="4">選択値4</MenuItem>
                <MenuItem value="5">選択値5</MenuItem>
              </Select>
            </Box>
          );
        },
      },
    ];

    return [
      ...fixedColDefs,
      ...dynamicColDefs.map<GridColDef>((def) => createDynamicColumnDefs(def)),
    ];
  }, [dynamicColDefs, createDynamicColumnDefs, selectItemState]);

  // 行編集イベント
  const processRowUpdate = (newRow: RowDataType, oldRow: RowDataType) => {
    console.log("processRowUpdate", { newRow, oldRow });

    if (!editedField) return newRow; // 未設定の場合、何もしない（ありえない。エラーにした方が良い）

    const { id, value } = newRow.detailItems.find(
      (item) => item.gridFieldName === editedField
    ) || { id: undefined, value: "" };

    // ★バックエンド更新処理
    console.log(
      `processRowUpdate for ${editedField} [id, value] = [${id}, ${value}]`
    );

    setEditedField(null); // 念のためクリア

    return newRow;
  };

  // 行編集終了イベント
  const onCellEditStop = (params: GridCellParams) => {
    console.log("cell edit stopped", params);
    setEditedField(params.field);
  };

  return {
    gridApiRef,
    rows,
    colums,
    isLoading,
    error,
    testDataId,
    setTestDataId,
    processRowUpdate,
    onCellEditStop,
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
