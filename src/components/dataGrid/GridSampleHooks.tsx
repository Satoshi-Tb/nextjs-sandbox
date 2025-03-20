import { Box, MenuItem, Select } from "@mui/material";
import {
  GridCellParams,
  GridColDef,
  gridExpandedSortedRowEntriesSelector,
  GridFilterInputValueProps,
  GridRenderCellParams,
  GridValueGetterParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { useEffect, useMemo, useRef, useState } from "react";

type SampleRowDataType1 = {
  id: number;
  category: string;
  item: string;
  selectItem1: string;
  selectItem2: string;
  textColor?: string;
};

const rowData: SampleRowDataType1[] = [
  {
    id: 1,
    category: "果物",
    item: "りんご",
    selectItem1: "A",
    selectItem2: "1",
  },
  {
    id: 2,
    category: "果物",
    item: "すいか",
    selectItem1: "B",
    selectItem2: "2",
  },
  {
    id: 3,
    category: "果物",
    item: "みかん",
    selectItem1: "C",
    selectItem2: "3",
  },
  {
    id: 4,
    category: "果物",
    item: "いちご",
    selectItem1: "D",
    selectItem2: "4",
  },
  { id: 5, category: "野菜", item: "なす", selectItem1: "0", selectItem2: "" },
  {
    id: 6,
    category: "野菜",
    item: "きゅうり",
    selectItem1: "A",
    selectItem2: "2",
  },
  { id: 7, category: "野菜", item: "大根", selectItem1: "A", selectItem2: "2" },
  {
    id: 8,
    category: "野菜",
    item: "ごぼう",
    selectItem1: "A",
    selectItem2: "3",
  },
  {
    id: 9,
    category: "野菜",
    item: "キャベツ",
    selectItem1: "B",
    selectItem2: "2",
  },
  {
    id: 10,
    category: "野菜",
    item: "長ネギ",
    selectItem1: "B",
    selectItem2: "3",
  },
  {
    id: 11,
    category: "野菜",
    item: "玉ねぎ",
    selectItem1: "C",
    selectItem2: "3",
  },
  {
    id: 12,
    category: "野菜",
    item: "にんじん",
    selectItem1: "A",
    selectItem2: "1",
  },
];

type ValueOpt = {
  value: string;
  label: string;
};
const VAL_OPTS_SEL1: ValueOpt[] = [
  { value: "0", label: "未選択" },
  { value: "A", label: "選択A" },
  { value: "B", label: "選択B" },
  { value: "C", label: "選択C" },
  { value: "D", label: "選択D" },
];

const VAL_OPTS_SEL2: ValueOpt[] = [
  { value: "1", label: "選択1" },
  { value: "2", label: "選択2" },
  { value: "3", label: "選択3" },
  { value: "4", label: "選択4" },
];

const INITIAL_PAGE_SIZE = 5;
export const useGridSampleHooks = () => {
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [filteredRowCount, setFilteredRowCount] = useState(0);

  const gridApiRef = useGridApiRef();

  // useRefのテスト。useState版との比較のため、サンプル実装
  // フィルタ後の行数を格納する。
  // 本来はuseStateを利用して、適切に再レンダリングを促すのが正しい実装。
  const filteredRowCountRef = useRef(0);
  // 強制再レンダリング用のトリガー。利用方法としては適切ではない。
  const [, forceUpdateState] = useState({});

  const initialSet = rowData.reduce<Record<string, string>>((acc, row) => {
    acc[row.id] = row.selectItem2;
    return acc;
  }, {});

  // 選択項目値(rowデータの外で管理)
  const [selectedItemSet, setSelectedItemSet] =
    useState<Record<string, string>>(initialSet);

  // 表示色の加工サンプル
  // const processedData: SampleRowDataType1[] = rawData.map(
  //   (data, index, arr) => {
  //     const isDuplicate =
  //       index !== 0 && data.category === arr[index - 1].category;
  //     const isFirstItemOfPage = index % pageSize === 0;
  //     let textColor;

  //     if (isFirstItemOfPage) {
  //       textColor = "black";
  //     } else {
  //       textColor = isDuplicate ? "white" : "black";
  //     }

  //     return {
  //       ...data,
  //       textColor,
  //     };
  //   }
  // );

  const handleUpdateFilteredRowsCount = () => {
    const rows = gridExpandedSortedRowEntriesSelector(
      gridApiRef.current.state,
      gridApiRef.current.instanceId
    );
    filteredRowCountRef.current = rows.length;
    // 強制再レンダリング。これを実施しないと、描画内容が変化しない。
    forceUpdateState({});
  };

  // カラム定義
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 50,
      },
      {
        field: "category",
        headerName: "分類名",
        width: 130,
        renderCell: (params) => (
          <div style={{ color: params.row.textColor ?? "black" }}>
            {params.value}
          </div>
        ),
      },
      {
        field: "item",
        headerName: "商品名",
        width: 130,
        editable: true,
      },
      {
        field: "selectItem1",
        headerName: "選択値(標準)",
        width: 130,
        type: "singleSelect",
        editable: true,
        valueOptions: VAL_OPTS_SEL1,
      },
      {
        field: "selectItem2",
        headerName: "選択項目カスタム",
        width: 150,
        valueGetter: (
          params: GridValueGetterParams<SampleRowDataType1, string>
        ) => selectedItemSet[params.id],
        renderCell: (
          params: GridRenderCellParams<SampleRowDataType1, string>
        ) => {
          // console.log("renderCell", { params });
          // params.valueは、valueGetter適用後
          return (
            <Select
              value={params.value}
              onChange={(event) => {
                const newValue = event.target.value;

                // 選択項目の状態を更新
                setSelectedItemSet((prevState) => ({
                  ...prevState,
                  [params.id]: newValue,
                }));

                gridApiRef.current.setEditCellValue(
                  {
                    id: params.id,
                    field: params.field,
                    value: newValue,
                  },
                  event
                );

                // 直接フィルタ呼び出し→ただしく動作しない。挙動がおかしい
                // gridApiRef.current.unstable_applyFilters();

                // // 強制的にeditモード&終了
                // // うまくいかず。「編集モードでないとstopできない」エラーが表示される。editModeの変更が反映されるまでラグがあるか？
                // gridApiRef.current.startCellEditMode({
                //   id: params.id,
                //   field: params.field,
                // });
                // gridApiRef.current.stopCellEditMode({
                //   id: params.id,
                //   field: params.field,
                // });
              }}
              displayEmpty={true}
            >
              {[{ value: "", label: "選択なし" }, ...VAL_OPTS_SEL2].map(
                (opt, idx) => (
                  <MenuItem key={idx} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                )
              )}
            </Select>
          );
        },
        filterOperators: [
          {
            label: "次の値と等しい",
            value: "equals",
            getApplyFilterFn: (filterItem, column) => {
              console.log("create getApplyFilterFn", { filterItem, column });
              if (!filterItem.value) return null;
              return (params: GridCellParams<SampleRowDataType1, string>) => {
                return filterItem.value === params.value;
              };
            },
            InputComponent: (props: GridFilterInputValueProps) => {
              const { item, applyValue } = props;
              return (
                <Select
                  value={item.value || ""}
                  onChange={(event) => {
                    const newValue = { ...item, value: event.target.value };
                    applyValue(newValue);
                  }}
                  sx={{ height: "100%", mt: "1rem" }}
                >
                  {[
                    {
                      value: "",
                      label: "選択してください",
                    },
                    {
                      value: "__NOT_SELECTED__",
                      label: "選択なし",
                    },
                    ...VAL_OPTS_SEL2,
                  ].map((opt, idx) => (
                    <MenuItem key={idx} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              );
            },
            getValueAsString: (value: string) =>
              value === "__NOT_SELECTED__"
                ? "選択なし"
                : VAL_OPTS_SEL2.find((opt) => opt.value === value)?.label || "",
          },
        ],
      },
    ],
    [selectedItemSet, gridApiRef]
  );

  useEffect(() => {
    const updateFilteredRowCount = () => {
      console.log("new filter applyed");
      if (gridApiRef.current) {
        const rows = gridExpandedSortedRowEntriesSelector(
          gridApiRef.current.state,
          gridApiRef.current.instanceId
        );
        setFilteredRowCount(rows.length);
      }
    };
    // 初期表示時
    updateFilteredRowCount();

    // フィルター変更時
    const unsubscribe = gridApiRef.current.subscribeEvent(
      "filteredRowsSet",
      updateFilteredRowCount
    );
    return () => {
      unsubscribe();
    };
  }, [gridApiRef]);

  return {
    pageSize,
    setPageSize,
    gridApiRef,
    row: rowData,
    columns,
    filteredRowCount,
    filteredRowCountRef,
    handleUpdateFilteredRowsCount,
  };
};
