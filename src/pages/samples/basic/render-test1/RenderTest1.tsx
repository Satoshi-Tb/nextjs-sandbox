import { useEffect } from "react";

export const RenderTest1 = () => {
  let someValue = "hello";

  console.log("RenderTest1 rendered", { someValue });

  useEffect(() => {
    someValue = "world";
    console.log("RenderTest1 useEffected", { someValue });
  }, []);

  return <div>{someValue}</div>;
};
