import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    gap: 16,
    width: Platform.select({
      android: "100%",
      default: "50%",
    }),
    margin: "auto",
  },
  cardMargin: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
});
