import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import { TextField, Box, Typography } from "@mui/material";

// カスタムテキストセルエディターのプロパティ型定義
interface CustomTextEditCellProps extends GridRenderEditCellParams {
  id: string | number;
  value?: string;
  field: string;
}

// カスタムテキストセルエディターコンポーネント
function CustomTextEditCell(props: CustomTextEditCellProps) {
  const { id, value, field } = props;
  const [valueState, setValueState] = useState<string>(value || "");
  const apiRef = useGridApiContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValueState(newValue);
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  useEffect(() => {
    setValueState(value?.toString() || "");
  }, [value]);

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
}

// データ行の型定義
interface RowData {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
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
export const GridSampleForIME = () => {
  const [rows, setRows] = useState<RowData[]>(initialRows);

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
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomTextEditCell {...params} />
      ),
    },
    {
      field: "description",
      headerName: "説明",
      width: 200,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomTextEditCell {...params} />
      ),
    },
    {
      field: "email",
      headerName: "メールアドレス",
      width: 200,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomTextEditCell {...params} />
      ),
    },
    {
      field: "phone",
      headerName: "電話番号",
      width: 150,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomTextEditCell {...params} />
      ),
    },
  ];

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
        MUI DataGrid カスタムテキストセルエディター
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        日本語入力時の問題を解決したカスタムセルエディターのサンプル
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
          //   experimentalFeatures={{ newEditingApi: true }}
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
              日本語（全角文字）を入力しても最初の文字が正しく処理されます
            </li>
            <li>EnterキーまたはTabキーで編集を確定します</li>
            <li>Escapeキーで編集をキャンセルします</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};
