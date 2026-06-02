import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: Platform.select({
      android: "900",
      default: "800",
    }),
    color: "#1f2937",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
  },
  deleteIconButton: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pokemonSlot: {
    width: "18%",
    minWidth: 58,
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  filledSlot: {
    backgroundColor: "#f8fafc",
    borderColor: "#e5e7eb",
    padding: 6,
  },
  emptySlot: {
    backgroundColor: "#f9fafb",
    borderStyle: "dashed",
    borderColor: "#d1d5db",
  },
  pokemonImage: {
    width: 34,
    height: 34,
  },
  pokemonName: {
    marginTop: 4,
    fontSize: 10,
    textAlign: "center",
    color: "#4b5563",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptySlotText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
  },
});