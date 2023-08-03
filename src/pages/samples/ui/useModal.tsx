import React, { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";

type useModalProps = {};

type ModalProps = {
  show: boolean;
  children: ReactNode;
};

export const useModal = ({}: useModalProps) => {
  const [show, setShow] = useState(false);

  const openModal = () => {
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
  };

  const Modal = ({ show, children }: ModalProps) => {
    const contentRef = useRef(null);

    useEffect(() => {
      if (contentRef.current === null) return;

      //TODO scroll固定。うまくいかない。
      if (show) {
        disableBodyScroll(contentRef.current, {
          reserveScrollBarGap: true,
        });
      } else {
        enableBodyScroll(contentRef.current);
      }

      return () => {
        clearAllBodyScrollLocks();
      };
    }, [show, contentRef]);

    if (!show) return null;
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "gray",
            opacity: "0.5",
          }}
        ></div>
        <div style={{ position: "relative" }} ref={contentRef}>
          {children}
        </div>
      </div>,
      document.getElementById("__next") as HTMLElement
    );
  };
  return { Modal, openModal, closeModal, show };
};
