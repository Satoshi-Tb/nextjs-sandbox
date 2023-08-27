import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectProps as MuiSelectProps } from "@mui/material";
import { useController } from "react-hook-form";
import type {
  FieldValues,
  UseControllerProps,
  DeepMap,
  FieldError,
} from "react-hook-form";

type SelectProps = {
  label: string;
  value: string;
};

type SelectFormProps = MuiSelectProps & {
  inputRef?: MuiSelectProps["ref"];
  errorMessage?: string;
  selectPropsList: SelectProps[];
  selectedValue: string;
};

const SelectForm: React.FC<SelectFormProps> = ({
  inputRef,
  errorMessage,
  selectPropsList,
  selectedValue,
  label,
  ...rest
}) => {
  return (
    <div>
      <FormControl>
        <InputLabel>{label}</InputLabel>
        <Select ref={inputRef} value={selectedValue} label={label} {...rest}>
          {selectPropsList.map((props) => (
            <MenuItem key={props.value} value={props.value}>
              {props.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {!!errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </div>
  );
};

export type RhfSelectProps<T extends FieldValues> = Omit<
  SelectFormProps,
  "selectedValue"
> &
  UseControllerProps<T>;

export const RhfSelect = <T extends FieldValues>(
  props: RhfSelectProps<T>
): JSX.Element => {
  const { name, control } = props;
  const {
    field: { ref, onChange, value: selectedValue, ...rest },
    fieldState: { error },
  } = useController<T>({ name, control });

  return (
    <SelectForm
      inputRef={ref}
      onChange={(e) => onChange(e)}
      {...rest}
      {...props}
      selectedValue={selectedValue}
      errorMessage={(error && error.message) || props.errorMessage}
    />
  );
};
