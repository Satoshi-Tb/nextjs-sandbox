import * as React from "react";
import {
  DataGrid,
  GridCellEditStopReasons,
  GridColDef,
  GridColTypeDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  MuiEvent,
  useGridApiContext,
} from "@mui/x-data-grid";
import { Box, InputBase, Paper, Typography } from "@mui/material";
import Popper from "@mui/material/Popper";
import { LoremIpsum } from "lorem-ipsum";

function isKeyboardEvent(
  event: MuiEvent<React.SyntheticEvent>
): event is MuiEvent<React.KeyboardEvent> {
  return "key" in event;
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

export default function GridRecipeMultilineEditing() {
  const [rows, setRows] = React.useState<GridRowModel[]>(() => createRows());

  const processRowUpdate = React.useCallback((newRow: GridRowModel) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? newRow : row))
    );
    return newRow;
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Grid Multiline Editing
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
          onCellEditStop={(params, event) => {
            if (params.reason !== GridCellEditStopReasons.enterKeyDown) {
              return;
            }

            if (isKeyboardEvent(event) && !event.ctrlKey && !event.metaKey) {
              event.defaultMuiPrevented = true;
            }
          }}
        />
      </Box>
    </Box>
  );
}
