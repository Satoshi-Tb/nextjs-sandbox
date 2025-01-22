import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridRenderEditCellParams,
  useGridApiContext,
  GridColTypeDef,
  GridCellEditStopReasons,
} from "@mui/x-data-grid";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import { LoremIpsum } from "lorem-ipsum";

const lines = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Aliquam dapibus, lorem vel mattis aliquet, purus lorem tincidunt mauris, in blandit quam risus sed ipsum.",
  "Maecenas non felis venenatis, porta velit quis, consectetur elit.",
  "Vestibulum commodo et odio a laoreet.",
  "Nullam cursus tincidunt auctor.",
  "Sed feugiat venenatis nulla, sit amet dictum nulla convallis sit amet.",
  "Nulla venenatis justo non felis vulputate, eu mollis metus ornare.",
  "Nam ullamcorper ligula id consectetur auctor.",
  "Phasellus et ultrices dui.",
  "Fusce facilisis egestas massa, et eleifend magna imperdiet et.",
  "Pellentesque ac metus velit.",
  "Vestibulum in massa nibh.",
  "Vestibulum pulvinar aliquam turpis, ac faucibus risus varius a.",
];

function isKeyboardEvent(event: any): event is React.KeyboardEvent {
  return !!event.key;
}

function EditTextarea(props: GridRenderEditCellParams<any, string>) {
  const { id, field, value, colDef, hasFocus } = props;
  const [valueState, setValueState] = React.useState(value);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>();
  const [inputRef, setInputRef] = React.useState<HTMLInputElement | null>(null);
  const apiRef = useGridApiContext();

  React.useLayoutEffect(() => {
    if (hasFocus && inputRef) {
      inputRef.focus();
    }
  }, [hasFocus, inputRef]);

  const handleRef = React.useCallback((el: HTMLElement | null) => {
    setAnchorEl(el);
  }, []);

  const handleChange = React.useCallback<
    NonNullable<InputBaseProps["onChange"]>
  >(
    (event) => {
      const newValue = event.target.value;
      setValueState(newValue);
      apiRef.current.setEditCellValue(
        { id, field, value: newValue, debounceMs: 200 },
        event
      );
    },
    [apiRef, field, id]
  );

  return (
    <div style={{ position: "relative", alignSelf: "flex-start" }}>
      <div
        ref={handleRef}
        style={{
          height: 1,
          width: colDef.computedWidth,
          display: "block",
          position: "absolute",
          top: 0,
        }}
      />
      {anchorEl && (
        <Popper open anchorEl={anchorEl} placement="bottom-start">
          <Paper elevation={1} sx={{ p: 1, minWidth: colDef.computedWidth }}>
            <InputBase
              multiline
              rows={4}
              value={valueState}
              sx={{ textarea: { resize: "both" }, width: "100%" }}
              onChange={handleChange}
              inputRef={(ref) => setInputRef(ref)}
            />
          </Paper>
        </Popper>
      )}
    </div>
  );
}

const multilineColumn: GridColTypeDef = {
  type: "string",
  renderEditCell: (params) => <EditTextarea {...params} />,
};

const columns: GridColDef[] = [
  { field: "id", headerName: "ID" },
  { field: "username", headerName: "Name", width: 150 },
  { field: "age", headerName: "Age", width: 80, type: "number" },
  {
    field: "bio",
    headerName: "Bio",
    width: 400,
    editable: true,
    ...multilineColumn,
  },
];

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

// ダミーデータ生成
const rows: GridRowModel[] = [];
for (let i = 0; i < 50; i += 1) {
  const bio = [];

  for (let j = 0; j < getRandomInt(10) + 1; j += 1) {
    bio.push(lorem.generateSentences(1));
  }

  rows.push({
    id: i,
    username: "ユーザー" + i,
    age: getRandomInt(100) + 1,
    bio: bio.join(" "),
  });
}

export const MultilineEditing = () => {
  const [cellNewValue, setCellNewValue] = React.useState("");
  const [cellOldValue, setCellOldValue] = React.useState("");

  // セル編集処理
  const handleProcessRowUpdate = async (newRow: any, oldRow: any) => {
    console.log("new row", newRow);
    console.log("old row", oldRow);

    setCellNewValue(newRow.bio as string);
    setCellOldValue(oldRow.bio as string);
    try {
      // DB更新が成功した場合、新しい行データを返してグリッドにコミットする
      return newRow;
    } catch (e) {
      console.log(e);
      // DB更新に失敗した場合は、変更を破棄する
      return oldRow;
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ height: 300, width: "80%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            processRowUpdate={handleProcessRowUpdate}
            onCellEditStop={(params, event) => {
              if (params.reason !== GridCellEditStopReasons.enterKeyDown) {
                return;
              }
              if (isKeyboardEvent(event) && !event.ctrlKey && !event.metaKey) {
                event.defaultMuiPrevented = true;
              }
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexFlow: "column",
            height: 400,
            width: "80%",
          }}
        >
          <div>編集前：</div>
          <p style={{ border: "solid", padding: "5", margin: "0" }}>
            {cellOldValue.replace(/\n/g, "<改行>")}
          </p>
          <div style={{ marginTop: "10px" }}>編集後：</div>
          <p style={{ border: "solid", padding: "5", margin: "0" }}>
            {cellNewValue.replace(/\n/g, "<改行>")}
          </p>
        </div>
      </div>
    </>
  );
};
