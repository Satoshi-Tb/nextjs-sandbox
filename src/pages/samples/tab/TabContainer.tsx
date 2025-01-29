import React, { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { TabContentA } from "./TabContentA";
import { TabContentB } from "./TabContentB";
import { TabContentC } from "./TabContentC";
import { TabNavigation } from "./TabNavigation";
import { RecoilRoot } from "recoil";

export const TabContainer = () => {
  const [tabValue, setTabValue] = useState("1");
  const [postId, setPostId] = useState("1");
  const [title, setTitle] = useState("");
  const [userName, setUserName] = useState("");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <RecoilRoot>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <Stack direction="column" justifyContent="left" spacing={1}>
          <Typography>Title: {title}</Typography>
          <Typography>Name: {userName}</Typography>
        </Stack>
        <TabContext value={tabValue}>
          <TabNavigation value={tabValue} onChange={handleChange} />
          <TabPanel value="1">
            <TabContentA setTitle={setTitle} postId={postId} />
          </TabPanel>
          <TabPanel value="2">
            <TabContentB postId={postId} setPostId={setPostId} />
          </TabPanel>
          <TabPanel value="3">
            <TabContentC setUserName={setUserName} />
          </TabPanel>
        </TabContext>
      </Box>
    </RecoilRoot>
  );
};
