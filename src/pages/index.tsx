import React, { useState } from "react";
import Link from "next/link";

function Home() {
  return (
    <div>
      <ul>
        <li>
          <Link href="/samples/rhf/sample1">react-hook-form sample1</Link>
        </li>
        <li>
          <Link href="/samples/rhf/sample2">react-hook-form sample2</Link>
        </li>
        <li>
          <Link href="/samples/rhf/sample3">react-hook-form sample3</Link>
        </li>
        <li>
          <Link href="/samples/swr/sample">swr sample</Link>
        </li>
        <li>
          <Link href="/samples/rich-editor">rich-editor</Link>
        </li>
        <li>
          <Link href="/samples/text-highlight">text-highlight & marker</Link>
        </li>
        <li>
          <Link href="/samples/text-highlight/multi">
            text-highlight (multi)
          </Link>
        </li>
        <li>
          <Link href="/samples/text-highlight/sample3">
            text-highlight sample3
          </Link>
        </li>
        <li>
          <Link href="/samples/text-highlight/sample4">
            text-highlight sample4
          </Link>
        </li>
        <li>
          <Link href="/samples/popup/parent">popup</Link>
        </li>
        <li>
          <Link href="/samples/data-grid/sample1">data grid</Link>
        </li>
        <li>
          <Link href="/samples/data-grid/sample2">
            data grid with multiline edit
          </Link>
        </li>
        <li>
          <Link href="/samples/data-grid/sample3">
            data grid with dynamic row definition
          </Link>
        </li>
        <li>
          <Link href="/samples/grid/sample1">grid</Link>
        </li>
        <li>
          <Link href="/samples/hoc/sample1">HOC</Link>
        </li>
        <li>
          <Link href="/samples/dynamic/samples/page1">DynamicRouting</Link>
        </li>
        <li>
          <Link href="/samples/tab">tab basic</Link>
        </li>
        <li>
          <Link href="/samples/basic">render test</Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/simple-highlight">
            simple-highlight
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/multicolor-highlight">
            multicolor-highlight
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/rangy-highlight-sample">
            rangy-highlight-sample
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/manual-highlight-sample">
            manual-highlight-sample(Range利用, 選択位置情報のみ保存)
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/manual-highlight-sample2">
            manual-highlight-sample(Path形式による永続化その１)
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/manual-highlight-sample3">
            manual-highlight-sample(Path形式による永続化その２)
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/range-serializer-sample">
            range-serializer-sample
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/manual-highlight-with-rangy">
            Rangyを利用した手動ハイライトデモ
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/manual-highlight-with-xpath">
            RangeAPIを利用した手動ハイライトデモ。永続化はXPath形式
          </Link>
        </li>
        <li>
          <Link href="/samples/manual-highlight/manual-highlight-with-css">
            CSS Highlight APIを利用した手動ハイライトデモ。永続化はXPath形式
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Home;
