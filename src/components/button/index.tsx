import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle } from "react-native";
import { styles } from "./styles";

type Props = TouchableOpacityProps & {
  title: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, style, ...rest }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.button, style, { backgroundColor: "#e53b3d" }]} {...rest}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}
