import { ColDefType } from "@/components/grid/DynamicCloumnGridHooks";
import { wait } from "@/utils/misc";
import { NextApiRequest, NextApiResponse } from "next";
import { URLSearchParams } from "url";

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
const dynamicColDefList: ColDefType[][] = [
  [
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
  ],
  [
    { fieldName: "maker", label: "メーカー", inputType: "1" },
    { fieldName: "color", label: "色", inputType: "1" },
    {
      fieldName: "size",
      label: "サイズ",
      inputType: "2",
      options: [
        {
          optKey: "sizeItemOotion",
          optValue: "XS",
          optName: "XS",
        },
        {
          optKey: "sizeItemOotion",
          optValue: "S",
          optName: "S",
        },
        {
          optKey: "sizeItemOotion",
          optValue: "M",
          optName: "M",
        },
        {
          optKey: "sizeItemOotion",
          optValue: "L",
          optName: "L",
        },
        {
          optKey: "sizeItemOotion",
          optValue: "XL",
          optName: "XL",
        },
      ],
    },
  ],
];

// テストデータ
const testRowData: any[][] = [
  [
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
  ],
  [
    {
      id: 1,
      category: "トップス",
      item: "クルーネックTシャツ",
      maker: "ユニクロ",
      color: "ホワイト",
      size: "S",
    },
    {
      id: 2,
      category: "トップス",
      item: "コンパクトジャケット",
      maker: "ノースフェイス",
      color: "ブラック",
      size: "L",
    },
  ],
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GridDynamicColumnListResponseType>
) {
  console.log("req.query", req.query);

  const { id } = req.query;

  let colDefData: ColDefType[];
  let rowData: any[];

  if (id === "1") {
    colDefData = dynamicColDefList[0];
    rowData = testRowData[0];
  } else {
    colDefData = dynamicColDefList[1];
    rowData = testRowData[1];
  }

  switch (req.method) {
    case "GET":
      // ダミーウェイト
      await wait(2000);

      res.status(200).json({
        code: "0000",
        errors: [],
        data: { colDefData: colDefData, rowData: rowData },
      });
      break;

    default:
      res.status(500);
      break;
  }
}
