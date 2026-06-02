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
  androidActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuTrigger: {
    padding: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  menuTriggerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.18)",
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuCard: {
    width: 180,
    marginTop: 68,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  button: {
    width: 100,
  },
  loggoutButton: {
    width: 120,
    backgroundColor: "#f0efef",
  },
  loggoutButtonIconOnly: {
    width: 44,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  loggoutButtonText: {
    color: "#e53b3d",
  },
});
