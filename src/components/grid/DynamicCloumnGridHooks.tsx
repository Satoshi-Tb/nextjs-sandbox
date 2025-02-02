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
import React from "react";

type ColDefType = {
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

  const isLoading = false;
  const error: { message: string } | undefined = (function (flg: boolean) {
    return undefined;
  })(false);

  // テストデータ
  const rows = [
    {
      id: 1,
      category: "果物",
      item: "りんご",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "1",
      checkItem: "0",
    },
    {
      id: 2,
      category: "果物",
      item: "すいか",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 3,
      category: "果物",
      item: "みかん",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "1",
      checkItem: "1",
    },
    {
      id: 4,
      category: "果物",
      item: "いちご",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 5,
      category: "野菜",
      item: "なす",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 6,
      category: "野菜",
      item: "きゅうり",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 7,
      category: "野菜",
      item: "大根",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 8,
      category: "野菜",
      item: "ごぼう",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 9,
      category: "野菜",
      item: "キャベツ",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 10,
      category: "野菜",
      item: "長ネギ",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 11,
      category: "野菜",
      item: "玉ねぎ",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
    {
      id: 12,
      category: "野菜",
      item: "にんじん",
      txtItem: "あいうえお",
      singleSelectItem: "A",
      switchItem: "0",
      checkItem: "1",
    },
  ];

  // テストカラム定義データ
  const dynamicColDefList: ColDefType[] = [
    { fieldName: "txtItem", label: "テキスト項目", inputType: "1" },
    {
      fieldName: "singleSelectItem",
      label: "選択項目",
      inputType: "2",
      options: [
        {
          optKey: "singleSelectItemOption",
          optValue: "A",
          optName: "アルファ",
        },
        {
          optKey: "singleSelectItemOption",
          optValue: "B",
          optName: "ブラボー",
        },
        {
          optKey: "singleSelectItemOption",
          optValue: "C",
          optName: "チャーリー",
        },
        {
          optKey: "singleSelectItemOption",
          optValue: "D",
          optName: "デルタ",
        },
      ],
    },
    {
      fieldName: "switchItem",
      label: "スイッチ項目",
      inputType: "3",
      options: [
        { optKey: "switchItemOption", optValue: "0", optName: "無効" },
        { optKey: "switchItemOption", optValue: "1", optName: "有効" },
      ],
    },
    {
      fieldName: "checkItem",
      label: "チェック項目",
      inputType: "4",
      options: [
        { optKey: "checkItemOption", optValue: "0", optName: "未" },
        { optKey: "checkItemOption", optValue: "1", optName: "済" },
      ],
    },
  ];

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
    ...dynamicColDefList.map<GridColDef>((def) => createDynamicColDef(def)),
  ];

  return { gridApiRef, rows, isLoading, error, colums };
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
