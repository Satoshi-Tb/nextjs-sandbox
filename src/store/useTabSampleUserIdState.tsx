import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState, atom } from "recoil";

const userIdState = atom<string>({
  key: "useTabSampleUserIdState",
  default: "",
});

export const useTabSampleUserIdState = () => {
  return useRecoilValue(userIdState);
};

export const useTabSampleUserIdStateMutator = () => {
  const setState = useSetRecoilState(userIdState);

  const setTabSampleUserId = useCallback(
    (condition: string) => setState(condition),
    [setState]
  );

  return { setTabSampleUserId };
};
