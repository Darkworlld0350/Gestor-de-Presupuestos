import { AppText } from "./AppText";

interface Props {
  children: string;
}

export function ChartTitle({ children }: Props) {
  return (
    <AppText
      style={{
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
      }}
    >
      {children}
    </AppText>
  );
}
