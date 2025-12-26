import { Text, TextProps } from "react-native";

interface Props extends TextProps {
  children: React.ReactNode;
}

export function AppText({ children, style, ...props }: Props) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}
