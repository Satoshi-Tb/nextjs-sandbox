import { DatePicker } from "@mui/x-date-pickers";
import { parse } from "date-fns";
import { useController } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { RhfTextField } from "./RhfTextField";

/** 日付フォーマットyyyy/MM/ddを文字列とみなした時の長さは10 */
const DATE_FORMAT_LENGTH = 10;

export type RhfDatePickerProps<T extends FieldValues> = UseControllerProps<T>;

export const RhfDatePicker = <T extends FieldValues>(
  props: RhfDatePickerProps<T>
) => {
  const { name, control } = props;
  const {
    field: { onChange, value },
  } = useController<T>({ name, control });

  const onSelectDate = (e: Date | null) => {
    onChange(e);
  };

  const onChangeText = (value: string) => {
    // MUIのDatePickerはデフォルトで10文字より多く入力できてしまうため、10文字を超えた分は省略する
    // ex) yyyy/MM/dd{任意の文字}のように入力できてしまう
    if (value.length > DATE_FORMAT_LENGTH) {
      onChange(
        parse(value.slice(0, DATE_FORMAT_LENGTH), "yyyy/MM/dd", new Date())
      );
      return;
    }
    onChange(parse(value, "yyyy/MM/dd", new Date()));
  };

  return (
    <DatePicker
      value={value || null}
      onChange={(e: Date | null) => onSelectDate(e)}
      slots={{
        textField: (params) => (
          <RhfTextField
            {...params}
            inputProps={{
              ...params.inputProps,
              placeholder: "yyyy/MM/dd",
            }}
            //            error={!!errors[name]}
            onChange={(e) => {
              // 数値以外を弾く
              if (!/^\d*$/.test(e.target.value)) return;
              onChangeText(e.target.value);
            }}
            defaultValue={undefined}
            name={name}
            control={control}
          />
        ),
      }}
    />
  );
};
