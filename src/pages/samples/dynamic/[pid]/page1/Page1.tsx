import Link from "next/link";
import { useRouter } from "next/router";

export const Page1 = () => {
  const router = useRouter();
  const { pid } = router.query;

  console.log("router", router);

  return (
    <div>
      <p>Pid: {pid}</p>
      <ul>
        <li>
          <Link href="/samples/dynamic/abc/page1">
            Go to /samples/dynamic/[pid]/page1, pid=abc
          </Link>
        </li>
        <li>
          <Link href="/samples/dynamic/xyz/page1">
            Go to /samples/dynamic/[pid]/page1, pid=xyz
          </Link>
        </li>
      </ul>
    </div>
  );
};
