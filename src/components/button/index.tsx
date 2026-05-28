import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  StyleSheet,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { styles } from "./styles";

type Props = TouchableOpacityProps & {
  title: string;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({ title, icon, style, textStyle, ...rest }: Props) {
  const Icon = icon;
  const iconColor = StyleSheet.flatten(textStyle)?.color || "#fff";

  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.button, { backgroundColor: "#e53b3d" }, style]} {...rest}>
      <View style={styles.content}>
        {Icon ? <Icon size={18} color={iconColor} strokeWidth={2.5} /> : null}
        <Text style={[styles.title, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
