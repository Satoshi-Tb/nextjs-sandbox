import React, { ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type useModalProps = {};

type ModalProps = {
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

  const Modal = ({ children }: ModalProps) => {
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
        <div style={{ position: "relative" }}>{children}</div>
      </div>,
      document.getElementById("__next") as HTMLElement
    );
  };
  return { Modal, openModal, closeModal };
};
