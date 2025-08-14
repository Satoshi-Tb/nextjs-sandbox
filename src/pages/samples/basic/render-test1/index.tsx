import { RenderTest1 } from "./RenderTest1";
import { RenderTest2 } from "./RenderTest2";

export default function index() {
  return (
    <>
      <div style={{ border: "1px solid black", padding: "10px" }}>
        <RenderTest1 />
      </div>
      <div style={{ border: "1px solid black", padding: "10px" }}>
        <RenderTest2 />
      </div>
    </>
  );
}
