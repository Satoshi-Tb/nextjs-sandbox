import type {
  ColDefType,
  RowDataType,
} from "@/components/grid/DynamicCloumnGridHooks";
import type { GridDynamicColumnListResponseType } from "@/components/swr/grid/useDynamicColumnData";
import { wait } from "@/utils/misc";
import { NextApiRequest, NextApiResponse } from "next";

// テストカラム定義データ
const dynamicColDefList: ColDefType[][] = [
  [
    {
      gridFieldName: "txtItem",
      fieldName: "txtItem",
      label: "テキスト項目",
      inputType: "1",
    },
    {
      gridFieldName: "singleSelectItem",
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
      gridFieldName: "switchItem",
      fieldName: "switchItem",
      label: "スイッチ項目",
      inputType: "3",
      options: [
        { optKey: "switchItemOption", optValue: "0", optName: "無効" },
        { optKey: "switchItemOption", optValue: "1", optName: "有効" },
      ],
    },
    {
      gridFieldName: "checkItem",
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
    {
      gridFieldName: "maker",
      fieldName: "maker",
      label: "メーカー",
      inputType: "1",
    },
    {
      gridFieldName: "color",
      fieldName: "color",
      label: "色",
      inputType: "1",
    },
    {
      gridFieldName: "size",
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
const testRowData: RowDataType[][] = [
  [
    {
      id: 1,
      category: "果物",
      item: "りんご",
      freeItems: [
        {
          id: 100,
          gridFieldName: "txtItem",
          fieldName: "txtItem",
          value: "あいうえお",
        },
        {
          id: 101,
          gridFieldName: "singleSelectItem",
          fieldName: "singleSelectItem",
          value: "A",
        },
        {
          id: 102,
          gridFieldName: "switchItem",
          fieldName: "switchItem",
          value: "1",
        },
        {
          id: 103,
          gridFieldName: "checkItem",
          fieldName: "checkItem",
          value: "0",
        },
      ],
    },
    {
      id: 2,
      category: "果物",
      item: "すいか",
      freeItems: [
        {
          id: 200,
          gridFieldName: "txtItem",
          fieldName: "txtItem",
          value: "あいうえお",
        },
        {
          id: 201,
          gridFieldName: "singleSelectItem",
          fieldName: "singleSelectItem",
          value: "A",
        },
        {
          id: 202,
          gridFieldName: "switchItem",
          fieldName: "switchItem",
          value: "1",
        },
        {
          id: 203,
          gridFieldName: "checkItem",
          fieldName: "checkItem",
          value: "0",
        },
      ],
    },
    {
      id: 3,
      category: "果物",
      item: "みかん",
      freeItems: [
        {
          id: 300,
          gridFieldName: "txtItem",
          fieldName: "txtItem",
          value: "あいうえお",
        },
        {
          id: 301,
          gridFieldName: "singleSelectItem",
          fieldName: "singleSelectItem",
          value: "A",
        },
        {
          id: 302,
          gridFieldName: "switchItem",
          fieldName: "switchItem",
          value: "1",
        },
        {
          id: 303,
          gridFieldName: "checkItem",
          fieldName: "checkItem",
          value: "0",
        },
      ],
    },
    {
      id: 4,
      category: "果物",
      item: "いちご",
      freeItems: [
        {
          id: 400,
          gridFieldName: "txtItem",
          fieldName: "txtItem",
          value: "あいうえお",
        },
        {
          id: 401,
          gridFieldName: "singleSelectItem",
          fieldName: "singleSelectItem",
          value: "A",
        },
        {
          id: 402,
          gridFieldName: "switchItem",
          fieldName: "switchItem",
          value: "1",
        },
        {
          id: 403,
          gridFieldName: "checkItem",
          fieldName: "checkItem",
          value: "0",
        },
      ],
    },
    {
      id: 5,
      category: "野菜",
      item: "なす",
      freeItems: [
        {
          id: 500,
          gridFieldName: "txtItem",
          fieldName: "txtItem",
          value: "あいうえお",
        },
        {
          id: 501,
          gridFieldName: "singleSelectItem",
          fieldName: "singleSelectItem",
          value: "A",
        },
        {
          id: 502,
          gridFieldName: "switchItem",
          fieldName: "switchItem",
          value: "1",
        },
        {
          id: 503,
          gridFieldName: "checkItem",
          fieldName: "checkItem",
          value: "0",
        },
      ],
    },
    {
      id: 6,
      category: "野菜",
      item: "きゅうり",
      freeItems: [
        {
          id: 600,
          gridFieldName: "txtItem",
          fieldName: "txtItem",
          value: "あいうえお",
        },
        {
          id: 601,
          gridFieldName: "singleSelectItem",
          fieldName: "singleSelectItem",
          value: "A",
        },
        {
          id: 602,
          gridFieldName: "switchItem",
          fieldName: "switchItem",
          value: "1",
        },
        {
          id: 603,
          gridFieldName: "checkItem",
          fieldName: "checkItem",
          value: "0",
        },
      ],
    },
  ],
  [
    {
      id: 11,
      category: "トップス",
      item: "クルーネックTシャツ",
      freeItems: [
        {
          id: 1101,
          gridFieldName: "maker",
          fieldName: "maker",
          value: "ユニクロ",
        },
        {
          id: 1102,
          gridFieldName: "color",
          fieldName: "color",
          value: "ホワイト",
        },
        { id: 1103, gridFieldName: "size", fieldName: "size", value: "S" },
      ],
    },
    {
      id: 12,
      category: "トップス",
      item: "コンパクトジャケット",
      freeItems: [
        {
          id: 1201,
          gridFieldName: "maker",
          fieldName: "maker",
          value: "ノースフェイス",
        },
        {
          id: 1202,
          gridFieldName: "color",
          fieldName: "color",
          value: "ブラック",
        },
        { id: 1203, gridFieldName: "size", fieldName: "size", value: "L" },
      ],
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
