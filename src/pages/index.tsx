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
          <Link href="/samples/rich-editor">rich-editor</Link>
        </li>
        <li>
          <Link href="/samples/text-highlight">text-highlith</Link>
        </li>
      </ul>
    </div>
  );
}

export default Home;
