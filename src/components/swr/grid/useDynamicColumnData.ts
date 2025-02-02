import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import type { ColDefType } from "@/components/grid/DynamicCloumnGridHooks";
import envConfig from "@/utils/envConfig";

type GridDynamicColumnListDataType = {
  colDefData: ColDefType[];
  rowData: any[];
};

export type GridDynamicColumnListResponseType = {
  code: string;
  errors: { message: string }[];
  data: GridDynamicColumnListDataType;
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
