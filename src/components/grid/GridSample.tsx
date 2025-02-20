import { Box, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";

export const GridSample = () => {
  return (
    <Stack
      direction="column"
      sx={{
        width: "80%",
        height: "100%",
        border: "1px solid red",
        gap: "10px",
      }}
    >
      <Grid container rowSpacing={1} columnSpacing={1}>
        <Grid item xs={1} alignContent="center">
          <Typography
            variant="body2"
            sx={{ border: "1px solid red", margin: "auto 0" }}
            textAlign="right"
          >
            ラベルあいうえお
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Paper elevation={2} sx={{ backgroundColor: "#f5f5f5", p: 1 }}>
            項目名１（xs=3）
          </Paper>
        </Grid>
        <Grid item xs={1} alignContent="center">
          <Typography
            variant="body2"
            sx={{ border: "1px solid red", margin: "auto 0" }}
            textAlign="right"
          >
            ラベルあいうえお
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <Paper sx={{ p: 1 }}>xs=4</Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ p: 1 }}>xs=8</Paper>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ width: "100%", height: "100%" }}>
        <ReadOnlyTextField />
        <WritableTextField />
        <ReadOnlyBox />
        <FocusableReadOnlyBox />
      </Stack>

      <Link href="/">TOP</Link>
    </Stack>
  );
};

const ReadOnlyTextField = () => {
  return (
    <TextField
      value="読み取り専用のテキストです。あいうえお。かきくけこ。"
      InputProps={{
        readOnly: true,
        sx: {
          backgroundColor: "#f5f5f5", // 背景色を少しグレーにする
          borderRadius: "4px",
          padding: "8px 5px",
        },
      }}
      sx={{ width: 150 }}
      variant="outlined"
      hiddenLabel
      multiline
      rows={3}
    />
  );
};
const WritableTextField = () => {
  return (
    <TextField
      placeholder="編集可能"
      sx={{ width: 150 }}
      variant="outlined"
      hiddenLabel
    />
  );
};

const ReadOnlyBox = () => {
  return (
    <Box
      sx={{
        padding: "5px 8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        color: "#333",
        fontSize: "16px",
        width: 150,
        cursor: "default",
        whiteSpace: "nowrap", // 1行表示に固定
        overflowX: "auto", // 横スクロール可能に
      }}
    >
      読み取り専用のテキスト
    </Box>
  );
};

const FocusableReadOnlyBox = () => {
  return (
    <Box
      tabIndex={0} // Tabキーでフォーカス可能に
      sx={{
        padding: "5px 8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f8f8f8",
        color: "#333",
        fontSize: "16px",
        width: 150,
        cursor: "text",
        outline: "none",
        "&:focus": {
          borderColor: "#007bff",
        },
        whiteSpace: "nowrap", // 1行表示に固定
        overflowX: "auto", // 横スクロール可能に
      }}
    >
      読み取り専用のテキスト
    </Box>
  );
};
