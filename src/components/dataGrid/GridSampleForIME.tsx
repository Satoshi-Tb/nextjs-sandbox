import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
  useGridApiContext,
  GridRowId,
  GridCellParams,
} from "@mui/x-data-grid";
import { TextField, Box, Typography } from "@mui/material";

// カスタムテキストセルエディターのプロパティ型定義
interface CustomTextEditCellProps extends GridRenderEditCellParams {
  id: string | number;
  value?: any;
  field: string;
  initialInput?: string; // 初期入力文字を追加
}

// カスタムテキストセルエディターコンポーネント
const CustomTextEditCell: React.FC<CustomTextEditCellProps> = (props) => {
  //function CustomTextEditCell(props: CustomTextEditCellProps) {
  const { id, value, field, initialInput } = props;
  const [valueState, setValueState] = useState<string>(() => {
    // 初期入力がある場合は初期入力を使用、なければ既存値を使用
    if (initialInput) {
      return initialInput;
    }
    return value?.toString() || "";
  });
  const apiRef = useGridApiContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValueState(newValue);
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  useEffect(() => {
    // initialInputがある場合は、既存値を置き換える
    if (initialInput) {
      setValueState(initialInput);
    } else {
      setValueState(value?.toString() || "");
    }
  }, [value, initialInput]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Tab") {
      apiRef.current.stopCellEditMode({ id, field });
    }
    if (event.key === "Escape") {
      apiRef.current.stopCellEditMode({ id, field, ignoreModifications: true });
    }
  };

  return (
    <TextField
      value={valueState}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      fullWidth
      variant="standard"
      autoFocus
      InputProps={{
        disableUnderline: true,
        style: { fontSize: "inherit", padding: "8px 16px" },
      }}
      inputProps={{
        style: {
          padding: 0,
          height: "100%",
          border: "none",
          outline: "none",
        },
      }}
    />
  );
};

// データ行の型定義
interface RowData {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
}

// セル選択状態の型定義
interface SelectedCell {
  id: GridRowId;
  field: string;
}

// サンプルデータ
const initialRows: RowData[] = [
  {
    id: 1,
    name: "田中 太郎",
    description: "プロジェクトマネージャー",
    email: "tanaka@example.com",
    phone: "090-1234-5678",
  },
  {
    id: 2,
    name: "佐藤 花子",
    description: "システムエンジニア",
    email: "sato@example.com",
    phone: "090-8765-4321",
  },
  {
    id: 3,
    name: "鈴木 次郎",
    description: "デザイナー",
    email: "suzuki@example.com",
    phone: "090-1111-2222",
  },
  {
    id: 4,
    name: "高橋 美咲",
    description: "フロントエンドエンジニア",
    email: "takahashi@example.com",
    phone: "090-3333-4444",
  },
  {
    id: 5,
    name: "山田 勇気",
    description: "バックエンドエンジニア",
    email: "yamada@example.com",
    phone: "090-5555-6666",
  },
];

// メインコンポーネント
export default function CustomDataGrid() {
  const [rows, setRows] = useState<RowData[]>(initialRows);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  // カスタムエディターを動的に生成（初期入力を考慮）
  const createCustomEditCell = (field: string) => {
    const RenderEditCell = (params: GridRenderEditCellParams) => {
      const initialInput =
        selectedCell?.field === field && pendingInput
          ? pendingInput
          : undefined;

      return <CustomTextEditCell {...params} initialInput={initialInput} />;
    };

    // デバッグしやすい表示名を付与
    RenderEditCell.displayName = `CustomEditCell(${field})`;
    return RenderEditCell;
  };

  // 列定義
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      editable: false,
    },
    {
      field: "name",
      headerName: "名前",
      width: 150,
      editable: true,
      renderEditCell: createCustomEditCell("name"),
    },
    {
      field: "description",
      headerName: "説明",
      width: 200,
      editable: true,
      renderEditCell: createCustomEditCell("description"),
    },
    {
      field: "email",
      headerName: "メールアドレス",
      width: 200,
      editable: true,
      renderEditCell: createCustomEditCell("email"),
    },
    {
      field: "phone",
      headerName: "電話番号",
      width: 150,
      editable: true,
      renderEditCell: createCustomEditCell("phone"),
    },
  ];

  // セルクリック時の処理
  const handleCellClick = (params: GridCellParams) => {
    if (params.field !== "id") {
      // ID列以外の場合
      setSelectedCell({ id: params.id, field: params.field });
      setPendingInput(null); // 前の入力をクリア
    }
  };

  // キー入力の先読み処理
  const handleCellKeyDown = (
    params: GridCellParams,
    event: React.KeyboardEvent
  ) => {
    // 選択されたセルがあり、編集可能な列で、通常の文字入力の場合
    if (
      selectedCell &&
      selectedCell.id === params.id &&
      selectedCell.field === params.field &&
      params.field !== "id" &&
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      // デフォルトの編集開始を防止
      event.preventDefault();
      event.stopPropagation();

      // 入力文字を保存
      setPendingInput(event.key);

      // カスタム編集モードを開始
      setTimeout(() => {
        params.api.startCellEditMode({ id: params.id, field: params.field });
      }, 0);
    }
  };

  // 編集開始後のクリーンアップ
  const handleCellEditStart = () => {
    // 編集開始後は pendingInput をクリア（次回のために）
    setTimeout(() => {
      setPendingInput(null);
    }, 100);
  };

  // 行更新時の処理
  const processRowUpdate = (newRow: RowData): RowData => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? newRow : row))
    );
    return newRow;
  };

  // エラーハンドリング
  const handleProcessRowUpdateError = (error: Error) => {
    console.error("行更新エラー:", error);
  };

  return (
    <Box sx={{ height: 600, width: "100%", p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MUI DataGrid カスタムテキストセルエディター（改良版）
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        すべての編集開始方法で日本語入力時の問題を解決したカスタムセルエディターのサンプル
      </Typography>

      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-cell--editing": {
            padding: 0,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onCellClick={handleCellClick}
          onCellKeyDown={handleCellKeyDown}
          onCellEditStart={handleCellEditStart}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": {
              borderRight: "1px solid #f0f0f0",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              borderBottom: "2px solid #e0e0e0",
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          使用方法:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>任意のセルをダブルクリックして編集モードに入ります</li>
            <li>
              セルを選択してから文字を入力しても、最初の文字が正しく処理されます
            </li>
            <li>
              キーボードでセルを移動してから文字入力しても正常に動作します
            </li>
            <li>
              日本語（全角文字）を入力しても最初の文字が正しく処理されます
            </li>
            <li>EnterキーまたはTabキーで編集を確定します</li>
            <li>Escapeキーで編集をキャンセルします</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
}
