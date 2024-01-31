/* eslint-disable react/display-name */
import React, { ComponentType, useEffect, useState } from "react";

// withLoading HOC
export const withLoading =
  <P extends {}>(WrappedComponent: ComponentType<P>) =>
  (props: P) => {
    console.log("withLoading: start.");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      console.log("withLoading: Component is mounted.");
      setTimeout(() => setIsLoading(false), 1000); // 仮の遅延
    }, []);

    return isLoading ? <div>Loading...</div> : <WrappedComponent {...props} />;
  };
