import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Popper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  getGridSingleSelectOperators,
  GridCellParams,
  GridColDef,
  GridColumnHeaderParams,
  GridFilterInputValueProps,
  GridFilterOperator,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowSelectionModel,
  GridValueGetterParams,
  GridValueSetterParams,
  useGridApiContext,
  useGridApiRef,
  ValueOptions,
} from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetListWithColumnDefs } from "../swr/grid/useDynamicColumnData";
import { useRouter } from "next/router";
import envConfig from "@/utils/envConfig";
import { PopperProps } from "@mui/material/Popper/BasePopper.types";

export type ColDefType = {
  gridFieldName: string;
  fieldName: string;
  categoryType?: string;
  categoryLabel?: string;
  categoryColor?: string;
  label: string;
  inputType: string;
  required?: boolean;
  options?: OptItemType[];
  width?: number;
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
  stdSelectItem: string;
  selectItem: string;
  detailItems: {
    id: number;
    gridFieldName: string;
    fieldName: string;
    value: string;
  }[];
};

export type InputErrorInfo = { id: number; errorFields: string[] };

const INPUT_TYPE = {
  TEXT: "1",
  SINGLE_SELECT: "2",
  SWITCH: "3",
  RADIO: "4",
  LABEL: "5",
} as const satisfies Record<string, string>;

const SAMPLE_SELECT_OPTIONS: OptItemType[] = [
  { optKey: "sampleSelectOption", optValue: "1", optName: "選択値1" },
  { optKey: "sampleSelectOption", optValue: "2", optName: "選択値2" },
  { optKey: "sampleSelectOption", optValue: "3", optName: "選択値3" },
  { optKey: "sampleSelectOption", optValue: "4", optName: "選択値4" },
  { optKey: "sampleSelectOption", optValue: "5", optName: "選択値5" },
];

// カラムフィルタ:未選択の場合のダミー値
const NO_SELECTION_COLUMN_FILTER_VAL = "__NOT_SELECTED__";

// カラムヘッダCSS生成用
const categoryExists = (def: ColDefType) =>
  !!(def.categoryType && def.categoryColor);
const getHeaderClassName = (def: ColDefType) =>
  `category-header-${def.categoryType}`;

// 動的選択項目の値セット
type SelectValueType = {
  [fieldName: string]: string;
};
type SelectValueSetType = {
  [rowId: number]: SelectValueType;
};

// 動的スイッチ項目の値セット
type SwitchValueType = { [fieldName: string]: boolean };
type SwitchValueSetType = {
  [rowId: number]: SwitchValueType;
};

// 動的ラジオ項目の値セット
type RadioValueType = { [fieldName: string]: string };
type RadioValueSetType = {
  [rowId: number]: RadioValueType;
};

/**
 * コンポーネント定義
 * @returns 動的適宜グリッドデータ（hooks）
 */
export const useDynamicColumnGridHooks = () => {
  const gridApiRef = useGridApiRef();

  const router = useRouter();

  const [testDataId, setTestDataId] = useState("1");

  // 編集後の列名
  const [editedField, setEditedField] = useState<string | null>(null);

  // 選択項目の状態管理
  const [selectItemState, setSelectItemState] = useState<{
    [rowId: string]: string;
  }>({});

  // 選択行リスト
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);

  // 入力チェックエラーリスト
  const [requiredErrorInfo, setRequiredErrorInfo] = useState<InputErrorInfo[]>(
    []
  );

  // 動的選択項目の値セット
  const [selectValueSet, setSelectValueSet] = useState<SelectValueSetType>({});
  // 動的スイッチ項目の値セット
  const [switchValueSet, setSwitchValueSet] = useState<SwitchValueSetType>({});
  // 動的ラジオ項目の値セット
  const [radioValueSet, setRadioValueSet] = useState<RadioValueSetType>({});

  const { data, isLoading, error, mutate } =
    useGetListWithColumnDefs(testDataId);

  if (error) {
    console.error("error", error);
    // router.push("/");  // エラー時のリダイレクト
  }

  const rowData = useMemo(() => data?.data?.rowData ?? [], [data]);
  const colDefs = useMemo(() => data?.data?.colDefData ?? [], [data]);

  // 初期値設定
  useEffect(() => {
    console.log("rows changed", { rows: rowData, colDefs });
    if (rowData.length > 0) {
      // 選択項目の初期値設定
      const initialSelectItemState = rowData.reduce<{
        [rowId: string]: string;
      }>((acc, row) => {
        acc[row.id] = row.selectItem;
        return acc;
      }, {});
      setSelectItemState(initialSelectItemState);

      // 選択項目の値セット初期化
      const singleSelectFields = colDefs
        .filter((d) => d.inputType === INPUT_TYPE.SINGLE_SELECT)
        .map((d) => d.gridFieldName);
      const initialSelectValueSet = rowData.reduce<SelectValueSetType>(
        (accValueSet, row) => {
          const selectValues = row.detailItems
            .filter((r) => singleSelectFields.includes(r.gridFieldName))
            .reduce<SelectValueType>((accValue, r) => {
              accValue[r.gridFieldName] = r.value;
              return accValue;
            }, {});

          accValueSet[row.id] = selectValues;
          return accValueSet;
        },
        {}
      );
      setSelectValueSet(initialSelectValueSet);

      // スイッチ選択項目の値セット初期化
      const switchFields = colDefs
        .filter((d) => d.inputType === INPUT_TYPE.SWITCH)
        .map((d) => d.gridFieldName);
      const initialSwitchValueSet = rowData.reduce<SwitchValueSetType>(
        (accSet, row) => {
          const switchValue = row.detailItems
            .filter((r) => switchFields.includes(r.gridFieldName))
            .reduce<SwitchValueType>((acc, r) => {
              acc[r.gridFieldName] = r.value === "1";
              return acc;
            }, {});

          accSet[row.id] = switchValue;
          return accSet;
        },
        {}
      );
      setSwitchValueSet(initialSwitchValueSet);

      // ラジオ項目の値セット初期化
      const radioFields = colDefs
        .filter((d) => d.inputType === INPUT_TYPE.RADIO)
        .map((d) => d.gridFieldName);
      const initialRadioValueSet = rowData.reduce<RadioValueSetType>(
        (accValueSet, row) => {
          const selectValues = row.detailItems
            .filter((r) => radioFields.includes(r.gridFieldName))
            .reduce<RadioValueType>((accValue, r) => {
              accValue[r.gridFieldName] = r.value;
              return accValue;
            }, {});

          accValueSet[row.id] = selectValues;
          return accValueSet;
        },
        {}
      );
      setRadioValueSet(initialRadioValueSet);
    }
  }, [rowData, colDefs]);

  // カラムヘッダーの背景色
  const columnHeaderStyles = useMemo(
    () =>
      colDefs.reduce<Record<string, object>>((styles, def) => {
        if (categoryExists(def)) {
          styles[`& .${getHeaderClassName(def)}`] = {
            backgroundColor: def.categoryColor,
          };
        }
        return styles;
      }, {}),
    [colDefs]
  );

  // カラム定義データから動的に定義生成
  // TODO データ構造が複雑なので、レンダリングパフォーマンス懸念
  // TODO カスタムセル定義の実装難易度に影響（valueの取り方）
  const createDynamicColumnDefs = useCallback(
    (colDef: ColDefType): GridColDef => {
      console.log("createDynamicColumnDefs 再作成", { selectValueSet });

      // 共通カラム定義設定
      const baseDef: GridColDef = {
        field: colDef.gridFieldName,
        width: colDef.width || 150,
        renderHeader: (params) => (
          <HeaderCell params={params} colDef={colDef} />
        ),
        headerClassName: categoryExists(colDef)
          ? getHeaderClassName(colDef)
          : "",
        headerName: colDef.label,
        valueGetter: (params: GridValueGetterParams<RowDataType, string>) =>
          params.row.detailItems.find(
            (f) => f.gridFieldName === colDef.gridFieldName
          )?.value || "",
        valueSetter: (params: GridValueSetterParams<RowDataType, string>) => {
          // 編集時に freeItems の該当する項目を更新
          const newValue = {
            ...params.row,
            detailItems: params.row.detailItems.map((f) =>
              f.gridFieldName === colDef.gridFieldName
                ? { ...f, value: params.value }
                : f
            ),
          };
          console.log("set value", { value: params.value, newValue });
          return newValue;
        },
      };

      switch (colDef.inputType) {
        case INPUT_TYPE.TEXT:
          return {
            ...baseDef,
            editable: true,
            renderCell: WrappedCell,
          };
        case INPUT_TYPE.SINGLE_SELECT:
          return {
            ...baseDef,
            type: "singleSelect",
            valueOptions: [
              "選択なし",
              ...(colDef.options?.map((opt) => opt.optName) || []),
            ],
            valueGetter: (
              params: GridValueGetterParams<RowDataType, string>
            ) => {
              const val =
                params.row.detailItems.find(
                  (f) => f.gridFieldName === colDef.gridFieldName
                )?.value || "";
              return val === ""
                ? "選択なし"
                : colDef.options?.find((opt) => opt.optValue === val)
                    ?.optName || "";
            },
            renderCell: (params) => (
              <SelectCell
                params={params}
                colDef={colDef}
                selectValueSet={selectValueSet}
                setSelectValueSet={setSelectValueSet}
              />
            ),
          };
        case INPUT_TYPE.SWITCH:
          return {
            ...baseDef,
            type: "singleSelect",
            valueOptions: colDef.options?.map((opt) => opt.optName) || [],
            valueGetter: (
              params: GridValueGetterParams<RowDataType, string>
            ) => {
              const val =
                params.row.detailItems.find(
                  (f) => f.gridFieldName === colDef.gridFieldName
                )?.value || "";
              return (
                colDef.options?.find((opt) => opt.optValue === val)?.optName ||
                ""
              );
            },
            renderCell: (params) => (
              <SwitchCell
                params={params}
                colDef={colDef}
                switchValueSet={switchValueSet}
                setSwitchValueSet={setSwitchValueSet}
              />
            ),
          };
        case INPUT_TYPE.RADIO:
          return {
            ...baseDef,
            type: "singleSelect",
            valueOptions: [
              "未選択",
              ...(colDef.options?.map((opt) => opt.optName) || []),
            ],
            valueGetter: (
              params: GridValueGetterParams<RowDataType, string>
            ) => {
              const val =
                params.row.detailItems.find(
                  (f) => f.gridFieldName === colDef.gridFieldName
                )?.value || "";
              return val === ""
                ? "未選択"
                : colDef.options?.find((opt) => opt.optValue === val)
                    ?.optName || "";
            },
            renderCell: (params) => (
              <RadioCell
                params={params}
                colDef={colDef}
                radioValueSet={radioValueSet}
                setRadioValueSet={setRadioValueSet}
              />
            ),
          };
        default:
          return {
            ...baseDef,
          };
      }
    },
    [selectValueSet, switchValueSet, radioValueSet]
  );

  /**
   * グリッドカラム定義
   */
  const colums = useMemo<GridColDef[]>(() => {
    console.log("colums defition 再計算");

    // 固定項目
    const fixedColDefs: GridColDef[] = [
      {
        field: "id",
        headerName: "ID",
        width: 80,
      },
      {
        field: "category",
        headerName: "分類名",
        width: 130,
      },
      {
        field: "item",
        headerName: "商品名",
        width: 130,
        editable: true,
      },
      {
        field: "stdSelectItem",
        headerName: "選択項目標準",
        width: 130,
        editable: true,
        ...applyGridSelectFilter([
          { value: "", label: "選択なし" },
          { value: "1", label: "選択値1" },
          { value: "2", label: "選択値2" },
          { value: "3", label: "選択値3" },
          { value: "4", label: "選択値4" },
          { value: "5", label: "選択値5" },
        ]),
      },
      {
        field: "selectItem",
        headerName: "選択項目カスタム",
        width: 150,
        ...applyGridSelectFilter([
          { value: "", label: "選択なし" },
          ...SAMPLE_SELECT_OPTIONS.map((opt) => ({
            value: opt.optValue,
            label: opt.optName,
          })),
        ]),
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
                  // 選択項目の状態を更新　※これだけだと、フィルタリング状態には影響しない。
                  setSelectItemState((prevState) => ({
                    ...prevState,
                    [param.id]: event.target.value,
                  }));

                  // Grid管理データの更新
                  gridApiRef.current.setEditCellValue(
                    {
                      id: param.id,
                      field: param.field,
                      value: event.target.value,
                    },
                    event
                  );

                  // バックエンド更新処理

                  // 再描画
                  mutate(
                    `${envConfig.apiUrl}/api/grid/dynamic-column/list/${testDataId}`
                  );
                }}
                displayEmpty={true}
              >
                {[
                  { optKey: "", optValue: "", optName: "選択なし" },
                  ...SAMPLE_SELECT_OPTIONS,
                ].map((opt, idx) => (
                  <MenuItem key={idx} value={opt.optValue}>
                    {opt.optName}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          );
        },
      },
    ];

    return [
      ...fixedColDefs,
      ...colDefs.map<GridColDef>((def) => createDynamicColumnDefs(def)),
    ];
  }, [
    colDefs,
    createDynamicColumnDefs,
    selectItemState,
    mutate,
    testDataId,
    gridApiRef,
  ]);

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
    // データリフレッシュ
    mutate(`${envConfig.apiUrl}/api/grid/dynamic-column/list/${testDataId}`);

    setEditedField(null); // 念のためクリア

    return newRow;
  };

  // 行編集終了イベント
  const onCellEditStop = (params: GridCellParams) => {
    console.log("cell edit stopped", params);
    setEditedField(params.field);
  };

  // 選択行変更
  const handleRowSelectionModelChange = (
    newSelectionModel: GridRowSelectionModel
  ) => {
    setRowSelectionModel(newSelectionModel);
  };

  // 入力チェックハンドラ
  const handleCheckInput = () => {
    console.log("入力チェック実施", { rowData });
    const errorInfo = rowData.reduce<InputErrorInfo[]>((acc, row) => {
      const errorFields = checkInput(row);
      if (errorFields.length > 0) {
        acc.push({ id: row.id, errorFields: errorFields });
      }
      return acc;
    }, []);
    console.log("入力チェック結果", errorInfo);
    if (errorInfo.length > 0) {
      console.log("エラーあり");
      // セルに色を付ける
    }

    setRequiredErrorInfo(errorInfo);
  };

  const checkInput = (row: RowDataType) => {
    const errorFields: string[] = [];

    const getValue = (row: RowDataType, colDef: ColDefType) => {
      switch (colDef.inputType) {
        case "1":
          return row.detailItems.find(
            (item) => item.gridFieldName === colDef.gridFieldName
          )?.value;
        case "2":
          return selectValueSet[row.id][colDef.fieldName];
        case "3":
          return switchValueSet[row.id][colDef.fieldName];
        default:
          return "dummy"; // 必須チェックtrueにするため、とりあえずdummy値を返す
      }
    };

    colDefs.forEach((def) => {
      if (def.required && !getValue(row, def)) {
        errorFields.push(def.fieldName);
      }
    });

    return errorFields;
  };

  return {
    gridApiRef,
    rows: rowData,
    colums,
    isLoading,
    error,
    testDataId,
    setTestDataId,
    processRowUpdate,
    onCellEditStop,
    handleCheckInput,
    rowSelectionModel,
    handleRowSelectionModelChange,
    requiredErrorInfo,
    columnHeaderStyles,
  };
};

type SelectCellPropTypes = {
  params: GridRenderCellParams<RowDataType, string>;
  colDef: ColDefType;
  disabled?: boolean;
  selectValueSet: SelectValueSetType;
  setSelectValueSet: React.Dispatch<React.SetStateAction<SelectValueSetType>>;
};
const SelectCell = ({
  params,
  colDef,
  disabled = false,
  selectValueSet,
  setSelectValueSet,
}: SelectCellPropTypes) => {
  const rowId = params.id as number;
  const value =
    (selectValueSet[rowId] && selectValueSet[rowId][colDef.gridFieldName]) ||
    "";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Select
        value={value}
        onChange={(event) => {
          setSelectValueSet({
            ...selectValueSet,
            [rowId]: {
              ...selectValueSet[rowId],
              [colDef.gridFieldName]: event.target.value,
            },
          });
        }}
        displayEmpty={true}
        disabled={disabled}
      >
        {[
          { optKey: colDef.gridFieldName, optName: "選択なし", optValue: "" },
          ...(colDef.options || []),
        ].map((opt) => (
          <MenuItem
            key={`${colDef.gridFieldName}_${opt.optValue}`}
            value={opt.optValue}
          >
            {opt.optName}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

type HeaderCellPropTypes = {
  params: GridColumnHeaderParams;
  colDef: ColDefType;
};
const HeaderCell = ({ params, colDef }: HeaderCellPropTypes) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {colDef.categoryLabel && (
        <Typography variant="body2">{colDef.categoryLabel}</Typography>
      )}
      <Typography variant="body2">
        {colDef.required && (
          <Typography
            variant="body2"
            sx={{ color: "red", mr: "3px" }}
            component="span"
          >
            *
          </Typography>
        )}
        {colDef.label}
      </Typography>
    </Box>
  );
};

type SwitchCellPropTypes = {
  params: GridRenderCellParams<RowDataType, string>;
  colDef: ColDefType;
  disabled?: boolean;
  switchValueSet: SwitchValueSetType;
  setSwitchValueSet: React.Dispatch<React.SetStateAction<SwitchValueSetType>>;
};
const SwitchCell = ({
  params,
  colDef,
  disabled = false,
  switchValueSet,
  setSwitchValueSet,
}: SwitchCellPropTypes) => {
  const rowId = params.id as number;
  const value =
    (switchValueSet[rowId] && switchValueSet[rowId][colDef.gridFieldName]) ||
    false;

  const unCheckedValueLabel = colDef.options ? colDef.options[0].optName : "";
  const checkedValueLabel = colDef.options ? colDef.options[1].optName : "";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Typography fontSize={14}>{unCheckedValueLabel}</Typography>
      <Switch
        checked={value}
        disabled={disabled}
        onClick={() => {
          setSwitchValueSet({
            ...switchValueSet,
            [rowId]: {
              ...switchValueSet[rowId],
              [colDef.gridFieldName]: !value,
            },
          });
        }}
      />
      <Typography fontSize={14}>{checkedValueLabel}</Typography>
    </Box>
  );
};

type RadioCellPropTypes = {
  params: GridRenderCellParams<RowDataType, string>;
  colDef: ColDefType;
  disabled?: boolean;
  radioValueSet: RadioValueSetType;
  setRadioValueSet: React.Dispatch<React.SetStateAction<RadioValueSetType>>;
};
const RadioCell = ({
  params,
  colDef,
  disabled = false,
  radioValueSet,
  setRadioValueSet,
}: RadioCellPropTypes) => {
  const rowId = params.id as number;
  const value =
    (radioValueSet[rowId] && radioValueSet[rowId][colDef.gridFieldName]) || "";

  return (
    <Box
      sx={{
        height: "100%",
        overflowX: "auto",
        width: "100%",
      }}
    >
      <RadioGroup
        row
        name="row-radio-buttons-group"
        sx={{
          flexWrap: "nowrap",
        }}
        onChange={(_, value) => {
          setRadioValueSet({
            ...radioValueSet,
            [rowId]: {
              ...radioValueSet[rowId],
              [colDef.gridFieldName]: value,
            },
          });
        }}
      >
        {[
          { optKey: colDef.gridFieldName, optName: "未選択", optValue: "" },
          ...(colDef.options || []),
        ].map((def, idx) => (
          <FormControlLabel
            key={`${colDef.gridFieldName}_${idx}`}
            value={def.optValue}
            control={<Radio disabled={disabled} />}
            label={<Typography fontSize={14}>{def.optName}</Typography>}
            checked={value === def.optValue}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

const WrappedCell = (params: GridRenderCellParams) => {
  return (
    <div
      style={{
        overflowY: "auto",
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
        height: "100%",
        width: "100%",
        paddingTop: "5px",
        paddingLeft: "5px",
      }}
    >
      {params.value}
    </div>
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

// カスタムフィルタサンプル実装
const applyGridSelectFilter = (options: { value: string; label: string }[]) => {
  const type = "singleSelect";
  const altBlankLabel = "(未選択)";

  // ブランクラベル置換。フィルタに""を含めることはできない
  // フィルターオプション（ラベル名）
  const valueOptions: ValueOptions[] = options.reduce<ValueOptions[]>(
    (prev, cur) => {
      // 値がブランクかつ、ラベルもブランクの場合、代替ラベルに置換する（ブランク文字はフィルター文字列に使えない）
      const label =
        cur.value === "" && cur.label === "" ? altBlankLabel : cur.label;

      // ラベルがブランクでない、かつ既存が無ければ追加
      if (label !== "" && !prev.some((l) => l === label)) prev.push(label);
      return prev;
    },
    []
  );

  const valueGetter = (params: GridValueGetterParams<RowDataType, string>) => {
    // ここのvalueはこのセルにセットされたrowの加工前のvalue
    return options.find((opt) => opt.value === params.value)?.label || "";
  };

  // 標準フィルタ動作に、ブランクラベルの考慮追加
  const filterOperators: GridFilterOperator<RowDataType, string>[] =
    getGridSingleSelectOperators().map((ope) => ({
      ...ope,
      getApplyFilterFn: (filterItem, column) => {
        if (!filterItem.value) return null;

        // params.valueは、valueGetterの結果
        switch (ope.value) {
          case "is": // 完全一致
            return (params) =>
              filterItem.value === altBlankLabel
                ? params.value === ""
                : filterItem.value === params.value;

          case "not": // 一致しない
            return (params) =>
              filterItem.value === altBlankLabel
                ? params.value !== ""
                : params.value !== filterItem.value;

          case "isAnyOf": // いずれかに一致
            if (
              !Array.isArray(filterItem.value) ||
              filterItem.value.length === 0
            )
              return null;
            return (params) => {
              return filterItem.value.includes(altBlankLabel)
                ? filterItem.value.includes(params.value) || params.value === ""
                : filterItem.value.includes(params.value);
            };

          default: // ありえない
            return ope.getApplyFilterFn(filterItem, column);
        }
      },
    }));

  return { type, valueOptions, valueGetter, filterOperators };
};

// フルカスタマイズ実装のサンプル
// cell typeは任意
// 標準実装のカスタマイズで対応できそうなので、採用は見送り。参考実装として控えておく
const sampleCustomGridSelectFiterOperators: GridFilterOperator<
  RowDataType,
  string
>[] = [
  {
    label: "...と等しい",
    value: "equals",
    getApplyFilterFn: (filterItem) => {
      if (filterItem.value == null || filterItem.value === "") {
        return null;
      }
      return (params: GridCellParams<RowDataType, string>) => {
        //const value = selectItemState[params.id];
        // paramsの内容以外だと、コール時点の状態で固定化される
        // ゆえに、値変更してもフィルタの内容が反映されていない
        // →propsの状態が変換してもgetApplyFilterFnは再評価されない
        // getApplyFilterFnは、filterModelが変更されたときに再評価される
        // getApplyFilterFnの返却するフィルタ関数に、引数追加することはできるか

        // valueGetterを定義することで、コンポーネント外に定義したstateを参照可能にする。
        // しかし、期待する挙動にならない

        return (
          params.value === filterItem.value ||
          (filterItem.value === NO_SELECTION_COLUMN_FILTER_VAL && !params.value)
        );
      };
    },
    InputComponent: (props: GridFilterInputValueProps) => {
      const { item, applyValue } = props;
      return (
        <FormControl variant="standard">
          <InputLabel id="select-item-equqls-select-label" shrink={true}>
            Value
          </InputLabel>
          <Select
            labelId="select-item-equqls-select-label"
            value={item.value || ""}
            onChange={(event) => {
              const newValue = { ...item, value: event.target.value };

              console.log("selectItem:equalsFilter onChange", {
                newValue,
              });
              applyValue(newValue);
            }}
          >
            {[
              {
                optKey: "sampleSelectOption",
                optValue: "",
                optName: "選択してください",
              },
              {
                optKey: "sampleSelectOption",
                optValue: NO_SELECTION_COLUMN_FILTER_VAL,
                optName: "未選択",
              },
              ...SAMPLE_SELECT_OPTIONS,
            ].map((opt, idx) => (
              <MenuItem key={idx} value={opt.optValue}>
                {opt.optName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    },
    getValueAsString: (value: string) =>
      value === NO_SELECTION_COLUMN_FILTER_VAL
        ? "未選択"
        : SAMPLE_SELECT_OPTIONS.find((opt) => opt.optValue === value)
            ?.optName || "",
  },
  {
    label: "...と等しくない",
    value: "notEquals",
    getApplyFilterFn: (filterItem) => {
      if (filterItem.value == null || filterItem.value === "") {
        return null;
      }
      return (params: GridCellParams<RowDataType, string>) => {
        return filterItem.value === NO_SELECTION_COLUMN_FILTER_VAL
          ? params.value !== ""
          : params.value !== filterItem.value;
      };
    },
    InputComponent: (props: GridFilterInputValueProps) => {
      const { item, applyValue } = props;
      return (
        <FormControl variant="standard">
          <InputLabel id="select-item-notequqls-select-label" shrink={true}>
            Value
          </InputLabel>
          <Select
            labelId="select-item-notequqls-select-label"
            value={item.value || ""}
            onChange={(event) =>
              applyValue({ ...item, value: event.target.value })
            }
          >
            <MenuItem value="">選択してください</MenuItem>
            {[
              {
                optKey: "sampleSelectOption",
                optValue: NO_SELECTION_COLUMN_FILTER_VAL,
                optName: "未選択",
              },
              ...SAMPLE_SELECT_OPTIONS,
            ].map((opt, idx) => (
              <MenuItem key={idx} value={opt.optValue}>
                {opt.optName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    },
    getValueAsString: (value: string) =>
      value === NO_SELECTION_COLUMN_FILTER_VAL
        ? "未選択"
        : SAMPLE_SELECT_OPTIONS.find((opt) => opt.optValue === value)
            ?.optName || "",
  },
  {
    label: "...を含む",
    value: "isAnyOf",
    getApplyFilterFn: (filterItem) => {
      // console.log("isAnyOf getApplyFilterFn", { filterItem });
      if (
        !filterItem.value ||
        !Array.isArray(filterItem.value) ||
        filterItem.value.length === 0
      ) {
        return null;
      }

      // 未選択値の読み替え
      const filteredValues = (filterItem.value as OptItemType[]).map((item) =>
        item.optValue === NO_SELECTION_COLUMN_FILTER_VAL ? "" : item.optValue
      );

      if (!filteredValues || filteredValues.length === 0) {
        return null;
      }

      return (params): boolean => {
        return filteredValues.includes(NO_SELECTION_COLUMN_FILTER_VAL)
          ? filteredValues.includes(params.value || "") || params.value === ""
          : filteredValues.includes(params.value || "");
      };
    },
    InputComponent: (props: GridFilterInputValueProps) => {
      const { item, applyValue } = props;

      const options = [
        {
          optKey: "sampleSelectOption",
          optValue: NO_SELECTION_COLUMN_FILTER_VAL,
          optName: "選択なし",
        },
        ...SAMPLE_SELECT_OPTIONS,
      ];

      // カスタムPopperコンポーネント（より広いドロップダウン表示用）
      const CustomPopper = function (props: PopperProps) {
        return (
          <Popper {...props} placement="bottom-start" style={{ width: 300 }} />
        );
      };

      return (
        <Autocomplete
          multiple
          options={options}
          getOptionLabel={(opt) => opt.optName}
          value={item.value || []}
          onChange={(event, value) => {
            // console.log("selectItem:isAnyOfFilter onChange", {
            //   item,
            //   value,
            // });
            const newValue = { ...item, value: value };
            applyValue(newValue);
          }}
          isOptionEqualToValue={(option, value) => {
            // console.log("isOptionEqualToValue", { option, value });
            return option.optValue === value.optValue;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="選択..."
              variant="standard"
              label="value"
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          )}
          PopperComponent={CustomPopper}
          disableCloseOnSelect
          size="small"
        />
      );
    },
    InputComponentProps: {
      type: "array",
    },
  },
];
