import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { TabList } from "@mui/lab";

interface TabNavigationProps {
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

export const TabNavigation = ({ value, onChange }: TabNavigationProps) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={value} onChange={onChange} aria-label="タブの例">
        <Tab label="タブ1" value="1" />
        <Tab label="タブ2" value="2" />
        <Tab label="タブ3" value="3" />
      </Tabs>
    </Box>
  );
};
