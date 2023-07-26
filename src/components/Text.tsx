import { useRef, useEffect } from "react";

export const Text = () => {
  // Create a ref for the container
  const textContainer = useRef(null);

  useEffect(() => {
    // The function to get the selected text
    const getSelectionText = () => {
      let selectedText = "";
      if (window.getSelection()) {
        selectedText = window.getSelection()?.toString() || "";
        console.log("Selected text: ", selectedText);
      } else if (document.getSelection()) {
        selectedText = document.getSelection()?.toString() || "";
        console.log("Selected text: ", selectedText);
      }
      // You can set the selectedText to state or do anything you want here
    };

    // Check to make sure the container exists
    if (textContainer.current) {
      // Add the mouse up listener to the container
      const elem = textContainer.current as HTMLDivElement;
      elem.addEventListener("mouseup", getSelectionText);
    }

    // Return a cleanup function to remove the listener when the component unmounts
    return () => {
      if (textContainer.current) {
        const elem = textContainer.current as HTMLDivElement;
        elem.removeEventListener("mouseup", getSelectionText);
      }
    };
  }, []);

  return <div ref={textContainer}>Select some of this text.</div>;
};
