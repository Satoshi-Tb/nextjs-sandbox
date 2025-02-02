import { ColDefType } from "@/components/grid/DynamicCloumnGridHooks";
import { wait } from "@/utils/misc";
import { NextApiRequest, NextApiResponse } from "next";

type GridDynamicColumnListDataType = {
  colDefData: ColDefType[];
  rowData: any[];
};

export type GridDynamicColumnListResponseType = {
  code: string;
  errors: { message: string }[];
  data: GridDynamicColumnListDataType;
};

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GridDynamicColumnListResponseType>
) {
  console.log("req.query", req.query);

  switch (req.method) {
    case "GET":
      // ダミーウェイト
      await wait(2000);

      res.status(200).json({
        code: "0000",
        errors: [],
        data: { colDefData: dynamicColDefList, rowData: rows },
      });
      break;

    default:
      res.status(500);
      break;
  }
}
