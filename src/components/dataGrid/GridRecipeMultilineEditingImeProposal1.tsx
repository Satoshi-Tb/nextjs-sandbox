import * as React from "react";
import {
  DataGrid,
  GridCellEditStopReasons,
  GridCellModes,
  GridCellParams,
  GridColDef,
  GridColTypeDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  MuiBaseEvent,
  MuiEvent,
  useGridApiContext,
} from "@mui/x-data-grid";
import { Box, InputBase, Paper, Typography } from "@mui/material";
import Popper from "@mui/material/Popper";
import { LoremIpsum } from "lorem-ipsum";

function hasKeyboardModifiers(
  event: MuiEvent<MuiBaseEvent>
): event is MuiEvent<
  MuiBaseEvent & {
    ctrlKey: boolean;
    metaKey: boolean;
  }
> {
  return "ctrlKey" in event && "metaKey" in event;
}

function isPrintableKeyDown(event: React.KeyboardEvent) {
  return (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  );
}

function shouldBlockPrintableEditStart(
  params: GridCellParams,
  event: MuiEvent<React.KeyboardEvent>
) {
  return (
    // 既知不具合は「view mode のまま printable key で編集開始する」経路で起きる。
    // 案1ではこの経路自体を止め、明示的な編集開始操作に寄せる。
    params.field === "bio" &&
    params.isEditable &&
    params.cellMode === GridCellModes.View &&
    isPrintableKeyDown(event)
  );
}

function EditTextarea(props: GridRenderEditCellParams<any, string>) {
  const { id, field, value, colDef, hasFocus } = props;
  const [valueState, setValueState] = React.useState(value ?? "");
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [inputRef, setInputRef] = React.useState<HTMLInputElement | null>(null);
  const apiRef = useGridApiContext();

  React.useEffect(() => {
    setValueState(value ?? "");
  }, [value]);

  React.useLayoutEffect(() => {
    if (hasFocus && inputRef) {
      inputRef.focus();
    }
  }, [hasFocus, inputRef]);

  const handleRef = React.useCallback((element: HTMLElement | null) => {
    setAnchorEl(element);
  }, []);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <Box sx={{ position: "relative", alignSelf: "flex-start", width: "100%" }}>
      <Box
        ref={handleRef}
        sx={{
          position: "absolute",
          top: 0,
          display: "block",
          width: colDef.computedWidth,
          height: 1,
        }}
      />
      {anchorEl ? (
        <Popper open anchorEl={anchorEl} placement="bottom-start">
          <Paper elevation={2} sx={{ p: 1, minWidth: colDef.computedWidth }}>
            <InputBase
              multiline
              rows={4}
              value={valueState}
              onChange={handleChange}
              inputRef={setInputRef}
              sx={{
                width: "100%",
                textarea: {
                  resize: "both",
                },
              }}
            />
          </Paper>
        </Popper>
      ) : null}
    </Box>
  );
}

const multilineColumn: GridColTypeDef = {
  type: "string",
  renderEditCell: (params) => <EditTextarea {...params} />,
};

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "username", headerName: "Name", width: 160 },
  { field: "age", headerName: "Age", width: 100, type: "number" },
  {
    field: "bio",
    headerName: "Bio",
    width: 420,
    editable: true,
    ...multilineColumn,
    renderCell: (params: GridRenderCellParams) => (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          py: 0.5,
        }}
      >
        {params.value}
      </Box>
    ),
  },
];

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    min: 4,
    max: 8,
  },
  wordsPerSentence: {
    min: 4,
    max: 16,
  },
});

function createRows(): GridRowModel[] {
  const rows: GridRowModel[] = [];

  for (let index = 0; index < 20; index += 1) {
    const bio: string[] = [];

    for (let line = 0; line < getRandomInt(6) + 1; line += 1) {
      bio.push(lorem.generateSentences(1));
    }

    rows.push({
      id: index,
      username: `User ${index}`,
      age: 20 + index,
      bio: bio.join("\n"),
    });
  }

  return rows;
}

export default function GridRecipeMultilineEditingImeProposal1() {
  const [rows, setRows] = React.useState<GridRowModel[]>(() => createRows());

  const processRowUpdate = React.useCallback((newRow: GridRowModel) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? newRow : row))
    );
    return newRow;
  }, []);

  const handleCellKeyDown = React.useCallback(
    (params: GridCellParams, event: MuiEvent<React.KeyboardEvent>) => {
      if (!shouldBlockPrintableEditStart(params, event)) {
        return;
      }

      // DataGrid のデフォルト編集開始を抑止し、IME 未確定文字の前に
      // ASCII キーが initialValue として混入するのを避ける。
      event.defaultMuiPrevented = true;
    },
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Grid Multiline Editing: IME対策案1
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        printable key による自動編集開始を止め、Enter / F2 /
        ダブルクリックでのみ編集開始します。
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Bio column is editable as multiline text. Save with Ctrl+Enter or
        Cmd+Enter.
      </Typography>
      <Box sx={{ height: 620, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={100}
          processRowUpdate={processRowUpdate}
          onCellKeyDown={handleCellKeyDown}
          onCellEditStop={(params, event) => {
            if (params.reason !== GridCellEditStopReasons.enterKeyDown) {
              return;
            }

            // Multiline editor では Enter を改行に使いたいので、
            // Ctrl/Cmd+Enter のときだけ DataGrid 側の確定処理を通す。
            if (hasKeyboardModifiers(event) && !event.ctrlKey && !event.metaKey) {
              event.defaultMuiPrevented = true;
            }
          }}
        />
      </Box>
    </Box>
  );
}
