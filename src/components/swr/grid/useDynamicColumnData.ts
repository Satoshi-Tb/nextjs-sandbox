import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import type {
  ColDefType,
  RowDataType,
} from "@/components/grid/DynamicCloumnGridHooks";
import envConfig from "@/utils/envConfig";

type GridDynamicColumnListDataType = {
  colDefData: ColDefType[];
  rowData: RowDataType[];
};

export type GridDynamicColumnListResponseType = {
  code: string;
  errors: { message: string }[];
  data: GridDynamicColumnListDataType | undefined;
};

export const useGetListWithColumnDefs = (id: string | undefined) => {
  const key = id
    ? `${envConfig.apiUrl}/api/grid/dynamic-column/list/${id}`
    : undefined;

  const { data, error, isLoading } = useSWR<GridDynamicColumnListResponseType>(
    key,
    fetcher
  );
  console.log("useGetListWithColumnDefs", { key, data });
  return { data, error, isLoading };
};
