import { styled, Button } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RhfTextField } from "@/components/rhf/RhfTextField";
import { RhfRadioGroup } from "@/components/rhf/RhfRadioGroup";
import { RhfSelect } from "@/components/rhf/RhfSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";

const Form = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  alignItems: "center",
  width: "100%",
  padding: "16px",
});

const Flex = styled("div")({
  display: "flex",
  gap: "16px",
});

const schema = z.object({
  text: z.string().min(1, { message: "Required" }),
  radio: z.string().min(1, { message: "Required" }),
  select: z.string().min(1, { message: "Required" }),
  date: z
    .date()
    .nullable()
    .refine((date) => date !== null, "Required"),
});

type Inputs = z.infer<typeof schema>;

const defaultValues: Inputs = {
  text: "",
  radio: "",
  select: "",
  date: null,
};

const selectProps = [
  {
    label: "りんご",
    value: "apple",
  },
  {
    label: "みかん",
    value: "orange",
  },
  {
    label: "ばなな",
    value: "banana",
  },
];

function RfhHome() {
  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    alert(data);
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <RhfTextField label="Text" name="text" control={control} />
      <RhfRadioGroup
        name="radio"
        control={control}
        radioPropsList={selectProps}
      />
      <RhfSelect
        label="Select"
        name="select"
        control={control}
        selectPropsList={selectProps}
      />
      {/* <RhfDatePicker name="date" control={control} /> */}
      <Flex>
        <Button type="submit">送信</Button>
        <Button onClick={() => reset()}>リセット</Button>
      </Flex>
    </Form>
  );
}

export default RfhHome;
