import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  title: {
    color: "#333",
    fontSize: 18,
    fontWeight: Platform.select({
      android: "800",
      default: "bold",
    }),
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 15,
    alignItems: "center",

    backgroundColor: "#f0efef",
    borderRadius: 15,
    boxShadow: " rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  button: {
    width: 100,
  },
  loggoutButton: {
    width: 120,
    backgroundColor: "#f0efef",
  },
  loggoutButtonText: {
    color: "#e53b3d",
  },
});
