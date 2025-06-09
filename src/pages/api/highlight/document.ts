import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    html: `
      <p><b>React</b>はFacebookが開発した<strong>UIライブラリ</strong>であり、</p>
      <p><span style="color:blue">コンポーネント指向</span>と仮想DOMによる高速描画を特徴としています。</p>
      <p>さらに、<sup>Next.js</sup>などのフレームワークとも併用されます。</p>
    `,
  });
}
