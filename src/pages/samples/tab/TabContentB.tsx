import {
  useTabSampleUserIdState,
  useTabSampleUserIdStateMutator,
} from "@/store/useTabSampleUserIdState";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { SetStateAction, useEffect, useState } from "react";

type Props = {
  postId: string;
  setPostId: (value: SetStateAction<string>) => void;
};

export const TabContentB = ({ postId, setPostId }: Props) => {
  const [inputPostId, setInputPostId] = useState("");
  const [inputUserId, setInputUserId] = useState("");

  const { setTabSampleUserId } = useTabSampleUserIdStateMutator();
  const userId = useTabSampleUserIdState();

  useEffect(() => {
    setInputPostId(postId);
    setInputUserId(userId);
  }, []);

  return (
    <div>
      <h2>タブBのコンテンツ</h2>
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={1}>
          <TextField
            key="UserId"
            value={inputUserId}
            onChange={(event) => setInputUserId(event.target.value)}
            label="UserId"
          />
          <Button
            onClick={() => {
              setTabSampleUserId(inputUserId);
            }}
          >
            更新
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            key="PostId"
            value={inputPostId}
            onChange={(event) => setInputPostId(event.target.value)}
            label="PostId"
          />
          <Button
            onClick={() => {
              setPostId(inputPostId);
            }}
          >
            更新
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};
