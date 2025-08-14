import { useEffect, useMemo, useState } from "react";
import { set } from "react-hook-form";

export const RenderTest2 = () => {
  let deps = "";
  const [depsState, setDepsState] = useState("");

  const someValue = useMemo(() => {
    console.log("RenderTest2 useMemoed", { deps });
    return "hello " + deps;
  }, [deps]);
  const someValue2 = useMemo(() => {
    console.log("RenderTest2 useMemoed2", { depsState });
    return "hello " + depsState;
  }, [depsState]);
  console.log("RenderTest2 rendered", {
    someValue,
    deps,
    someValue2,
    depsState,
  });

  useEffect(() => {
    // useMemoに影響を与えない
    deps = "world";
    setDepsState("world");

    console.log("RenderTest2 useEffected", { deps, depsState });
  }, []);

  return (
    <>
      <div>value1:{someValue}</div>
      <div>value2:{someValue2}</div>
    </>
  );
};
