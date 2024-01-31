/* eslint-disable react/display-name */
import { ComponentType, useEffect } from "react";

// withLogger HOC
export const withLogger =
  <P extends {}>(WrappedComponent: ComponentType<P>) =>
  (props: P) => {
    console.log("withLogger: start.");
    useEffect(() => {
      console.log("withLogger: Component is mounted.");
      return () => console.log("Component will unmount.");
    }, []);

    return <WrappedComponent {...props} />;
  };
