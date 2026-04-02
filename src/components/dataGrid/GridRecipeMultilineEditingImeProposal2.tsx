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

function isImeLikeKeyDown(event: MuiEvent<React.KeyboardEvent>) {
  const nativeEvent = event.nativeEvent as KeyboardEvent & {
    isComposing?: boolean;
  };

  return (
    // ブラウザ差異を吸収するため、IME 中によく観測されるシグナルを重ねて見る。
    event.which === 229 ||
    nativeEvent.isComposing === true ||
    nativeEvent.keyCode === 229
  );
}

function shouldBlockImePrintableEditStart(
  params: GridCellParams,
  event: MuiEvent<React.KeyboardEvent>
) {
  return (
    // 案2では半角直接入力の UX は残しつつ、IME 疑い入力のときだけ
    // printable key 起点の編集開始を抑止する。
    params.field === "bio" &&
    params.isEditable &&
    params.cellMode === GridCellModes.View &&
    isPrintableKeyDown(event) &&
    isImeLikeKeyDown(event)
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

export default function GridRecipeMultilineEditingImeProposal2() {
  const [rows, setRows] = React.useState<GridRowModel[]>(() => createRows());

  const processRowUpdate = React.useCallback((newRow: GridRowModel) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? newRow : row))
    );
    return newRow;
  }, []);

  const handleCellKeyDown = React.useCallback(
    (params: GridCellParams, event: MuiEvent<React.KeyboardEvent>) => {
      if (!shouldBlockImePrintableEditStart(params, event)) {
        return;
      }

      // IME 開始直後だけ DataGrid の自動編集開始を止めることで、
      // initialValue への ASCII 混入を局所的に回避する。
      event.defaultMuiPrevented = true;
    },
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Grid Multiline Editing: IME対策案2
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        IME 疑い入力のときだけ printable key
        起点の自動編集開始を止め、半角直接入力は既存挙動を残します。
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
