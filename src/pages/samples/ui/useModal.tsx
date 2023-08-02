import React, { ReactNode } from "react";

type useModalProps = {};

type ModalProps = {
  children: ReactNode;
};

export const useModal = ({}: useModalProps) => {
  const Modal = ({ children }: ModalProps) => {
    return <>{children}</>;
  };
  return { Modal };
};
