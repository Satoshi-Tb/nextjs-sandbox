import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup as MuiRadioGroup,
} from "@mui/material";
import type { RadioGroupProps as MuiRadioGroupProps } from "@mui/material";
import { useController } from "react-hook-form";
import type { FieldValues, UseControllerProps } from "react-hook-form";

type RadioProps = {
  value: string;
  label: string;
};

type RadioGroupProps = MuiRadioGroupProps & {
  inputRef?: MuiRadioGroupProps["ref"];
  errorMessage?: string;
  radioPropsList: RadioProps[];
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  inputRef,
  radioPropsList,
  errorMessage,
  ...rest
}) => {
  return (
    <div>
      <FormControl error={!!errorMessage}>
        <MuiRadioGroup ref={inputRef} {...rest}>
          {radioPropsList.map((el) => (
            <FormControlLabel
              key={el.value}
              value={el.value}
              label={el.label}
              control={<Radio />}
            />
          ))}
        </MuiRadioGroup>
      </FormControl>
      {!!errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </div>
  );
};

export type RhfRadioGroupProps<T extends FieldValues> = RadioGroupProps &
  UseControllerProps<T>;

export const RhfRadioGroup = <T extends FieldValues>(
  props: RhfRadioGroupProps<T>
): JSX.Element => {
  const { name, control, ...rest } = props;
  const {
    field: { ref, ...restControllerProps },
  } = useController<T>({ name, control });

  return <RadioGroup inputRef={ref} {...restControllerProps} {...rest} />;
};
