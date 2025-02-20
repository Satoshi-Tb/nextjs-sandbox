import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridRenderEditCellParams,
  useGridApiContext,
  GridColTypeDef,
  GridCellEditStopReasons,
  GridRenderCellParams,
  useGridApiRef,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  GridCellParams,
  GridFilterModel,
} from "@mui/x-data-grid";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import { LoremIpsum } from "lorem-ipsum";
import { Button, Typography } from "@mui/material";
import Link from "next/link";

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
      {anchorEl ? (
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
      ) : (
        <>
          <div>hello</div>
        </>
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
    renderCell: (param: GridRenderCellParams) => (
      <div
        style={{
          overflowY: "auto",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          height: "100%",
          width: "100%",
          paddingTop: "2px",
          paddingLeft: "2px",
        }}
      >
        {param.value}
      </div>
    ),
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

export const MultilineEditing = () => {
  const [cellNewValue, setCellNewValue] = React.useState("");
  const [cellOldValue, setCellOldValue] = React.useState("");
  // グリッドデータ
  const [rows, setRows] = React.useState<GridRowModel[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | undefined>(
    undefined
  );

  // api操作用（gridコンポーネント外から操作する場合）
  const apiRef = useGridApiRef();

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

  React.useEffect(() => {
    const rowData: any[] = [];
    // ダミーデータ生成
    for (let i = 0; i < 50; i += 1) {
      const bio = [];

      for (let j = 0; j < getRandomInt(10) + 1; j += 1) {
        bio.push(lorem.generateSentences(1));
      }

      rowData.push({
        id: i,
        username: "ユーザー" + i,
        age: i + 10,
        bio: bio.join(" "),
      });
    }
    setRows(rowData);
    apiRef.current.selectRow(rowData[0].id);
    setSelectedId(rowData[0].id);
  }, []);

  // セルキー押下処理
  const handleCellKeyDown = (
    params: GridCellParams,
    event: React.KeyboardEvent
  ) => {
    //    console.log("handleCellKeyDown", { params, event });

    // ソート・フィルター後のidリスト取得
    const ids = gridFilteredSortedRowIdsSelector(apiRef);
    if (event.code === "ArrowDown" || event.code === "ArrowUp") {
      const curPos = ids.findIndex((v) => v === params.id);

      if (curPos === -1) return;

      if (event.code === "ArrowDown") {
        if (curPos === ids.length - 1) return;
        setSelectedId(ids[curPos + 1] as number);
      } else {
        if (curPos === 0) {
          event.preventDefault(); // ヘッダー行にカーソル進めないようにする
          return;
        }
        setSelectedId(ids[curPos - 1] as number);
      }
    }
  };

  const updateSelectedIdAfterFilter = (param: any) => {
    // フィルタで表示データ変更の場合。
    // フィルター後、表示行０件→リセット
    // フィルター後、選択行あり→そのまま
    // フィルター後、選択行なし→先頭行を選択

    // フィルター変更時の選択状態調整
    // onFilterイベントではフィルター前のデータしか取得できなかった
    const ids = gridFilteredSortedRowIdsSelector(apiRef);
    //console.log("filter changed", { ids, param, apiRef });
    console.log("state changed", { param, apiRef, ids });
    if (ids.length === 0) {
      setSelectedId(undefined);
    } else if (!ids.find((id) => id === selectedId)) {
      setSelectedId(ids[0] as number);
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
        <div style={{ height: 500, width: "80%" }}>
          <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            processRowUpdate={handleProcessRowUpdate}
            rowHeight={100}
            onCellClick={(params) => {
              // disableRowSelectionOnClickを無効にすると正しく動作しない
              // →cellクリックの後に、statechangeが起動するようになるため。
              console.log("cell click");
              setSelectedId(params.row.id);
            }}
            onCellKeyDown={handleCellKeyDown}
            onStateChange={(params) => updateSelectedIdAfterFilter(params)}
            onCellEditStop={(params, event) => {
              if (params.reason !== GridCellEditStopReasons.enterKeyDown) {
                return;
              }
              if (isKeyboardEvent(event) && !event.ctrlKey && !event.metaKey) {
                event.defaultMuiPrevented = true;
              }
            }}
            onRowClick={(params) => {
              // セルクリックだけだと、反応しない場合あり。rowクリックで選択状態更新したほうが良いかも
              console.log("row click", params);
            }}
            sx={{
              // 優先度はホバー＞クリック行＞チェックボックス選択
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "rgba(0, 255, 0, 0.3)", // チェックボックスによる選択行の背景色
              },
              "& .MuiDataGrid-row.selected-row": {
                backgroundColor: "rgba(255, 165, 0, 0.5)", // クリックした行の色
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(0, 0, 255, 0.1)", // ホバー時の色
              },
            }}
            getRowClassName={(params) =>
              params.id === selectedId ? "selected-row" : ""
            }
          />
        </div>
      </div>
      <Button
        onClick={() => {
          const ids = gridFilteredSortedRowIdsSelector(apiRef);
          console.log("gridFilteredSortedRowIdsSelector", ids);
          apiRef.current.selectRow(
            ids[0],
            apiRef.current.isRowSelected(ids[0])
          );
        }}
      >
        1行目選択
      </Button>
      <Typography>選択行のID: {selectedId}</Typography>
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
          <p
            style={{
              borderColor: "red",
              borderWidth: 1,
              borderStyle: "solid",
              padding: "5",
              margin: "0",
              width: "300px",
              height: "100px",
              overflowY: "auto",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            {cellOldValue.replace(/\n/g, "<改行>")}
          </p>
          <div style={{ marginTop: "10px" }}>編集後：</div>
          <p style={{ border: "solid", padding: "5", margin: "0" }}>
            {cellNewValue.replace(/\n/g, "<改行>")}
          </p>
        </div>
        {/* フッター */}
        <Link href="/">TOP</Link>
      </div>
    </>
  );
};
