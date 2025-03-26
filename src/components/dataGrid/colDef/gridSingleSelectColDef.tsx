import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import {
  ColDefType,
  OptItemType,
  RowDataType,
  SelectValueSetType,
} from "../DynamicCloumnGridHooks";
import { Box, MenuItem, Select } from "@mui/material";

export const gridSingleSelectColDef = (
  defBase: GridColDef,
  colDef: ColDefType,
  selectValueSet: SelectValueSetType,
  setSelectValueSet: React.Dispatch<React.SetStateAction<SelectValueSetType>>,
  dsplayEmpty: boolean = true,
  disabled: boolean = false
): GridColDef => {
  const DEFAULT_NONE_OPTION = {
    optKey: colDef.gridFieldName,
    optName: "選択なし",
    optValue: "",
  };

  // オプションからラベルリストを取得
  const getOptionLabels = (
    options: OptItemType[] | undefined,
    dispEmpty: boolean = true
  ): string[] => {
    if (options === undefined) return [];

    const labels = options.map((opt) => opt.optName);

    return dispEmpty ? ["選択なし", ...labels] : labels;
  };

  // 値からラベルを取得
  const getOptionLabel = (
    value: string | undefined,
    options: OptItemType[] | undefined,
    dispEmpty: boolean = true
  ): string | undefined => {
    if (value === undefined || options === undefined) return undefined;

    if (dispEmpty && value === "") return "選択なし";

    // オプションから該当するラベルを検索
    return options.find((opt) => opt.optValue === value)?.optName;
  };

  // セレクトオプションの生成
  const createSelectOptions = (
    options: OptItemType[] | undefined,
    dispEmpty: boolean = true
  ): OptItemType[] => {
    if (options === undefined) return [];

    return dispEmpty ? [DEFAULT_NONE_OPTION, ...options] : options;
  };

  return {
    ...defBase,
    type: "singleSelect",
    valueOptions: getOptionLabels(colDef.options),
    valueGetter: (params: GridValueGetterParams<RowDataType, string>) => {
      const val = params.row.detailItems.find(
        (f) => f.gridFieldName === colDef.gridFieldName
      )?.value;
      return getOptionLabel(val, colDef.options);
    },
    renderCell: (params: GridRenderCellParams<RowDataType, string>) => {
      const rowId = params.id as number;
      const value =
        (selectValueSet[rowId] &&
          selectValueSet[rowId][colDef.gridFieldName]) ||
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
            {createSelectOptions(colDef.options).map((opt) => (
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
    },
  };
};
