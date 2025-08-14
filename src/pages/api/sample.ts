import { wait } from "@/utils/misc";
import { NextApiRequest, NextApiResponse } from "next";
import { RowItem } from "../samples/basic/render-test2";

export type FormDataResponse = {
  code: string;
  message: string;
  data?: RowItem[];
};

const ITEM_COUNT = 50;

let sampleItems: RowItem[] = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: `Value ${i + 1}`,
}));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FormDataResponse>
) {
  switch (req.method) {
    case "GET":
      // ダミーwait
      await wait(1000);

      res.status(200).json({ code: "0000", message: "", data: sampleItems });
      break;

    case "POST":
      const data = req.body as RowItem[]; // 送信されたJSONデータ
      console.log("Received data:", data);
      // ダミーwait
      await wait(500);

      // POSTされたデータのみ更新
      sampleItems.forEach((item) => {
        const updatedItem = data.find((d) => d.id === item.id);
        if (updatedItem) {
          item.value = updatedItem.value;
        }
      });

      res.status(200).json({
        code: "0000",
        message: "データが正常に受信されました！",
      });
      break;

    default:
      res.status(500);
      break;
  }
}
