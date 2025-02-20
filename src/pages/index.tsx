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
      </ul>
    </div>
  );
}

export default Home;
