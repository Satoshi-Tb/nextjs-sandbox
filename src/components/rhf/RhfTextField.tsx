import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { FormHelperText, TextField, TextFieldProps } from "@mui/material";

type MuiTextFieldProps = TextFieldProps & {
  inputRef?: TextFieldProps["ref"];
  errorMessage?: string;
};

const MuiTextField = ({
  inputRef,
  errorMessage,
  ...rest
}: MuiTextFieldProps) => {
  return (
    <>
      <TextField ref={inputRef} error={!!errorMessage} {...rest} />
      {!!errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </>
  );
};

export type RhfTextFieldProps<T extends FieldValues> = MuiTextFieldProps &
  UseControllerProps<T>;

export const RhfTextField = <T extends FieldValues>(
  props: RhfTextFieldProps<T>
) => {
  const { name, control } = props;
  const {
    field: { ref, ...rest },
    fieldState: { error },
  } = useController<T>({ name, control });

  return (
    <MuiTextField
      inputRef={ref}
      {...rest}
      {...props}
      errorMessage={(error && error.message) || props.errorMessage}
    />
  );
};
