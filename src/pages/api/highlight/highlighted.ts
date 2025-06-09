import type { NextApiRequest, NextApiResponse } from "next";

let highlightData: string = "";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json({ html: highlightData });
  } else if (req.method === "POST") {
    highlightData = req.body.html;
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}
