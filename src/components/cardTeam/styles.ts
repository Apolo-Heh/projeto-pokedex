import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    gap: Platform.select({
      web: 10,
      default: 14,
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: Platform.select({
      web: "center",
      default: "flex-start",
    }),
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: Platform.select({
      web: 22,
      default: 20,
    }),
    fontWeight: Platform.select({
      android: "900",
      default: "800",
    }),
    color: "#1f2937",
  },
  subtitle: {
    marginTop: 2,
    fontSize: Platform.select({
      web: 14,
      default: 13,
    }),
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
    justifyContent: Platform.select({
      web: "space-evenly",
      default: "space-between",
    }),
    gap: Platform.select({
      web: 8,
      default: 10,
    }),
  },
  pokemonSlot: {
    width: Platform.select({
      web: "16%",
      default: "18%",
    }),
    minWidth: Platform.select({
      web: 126,
      default: 58,
    }),
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
    padding: Platform.select({
      web: 6,
      default: 6,
    }),
  },
  emptySlot: {
    backgroundColor: "#f9fafb",
    borderStyle: "dashed",
    borderColor: "#d1d5db",
  },
  pokemonImage: {
    width: "48%",
    height: "48%",
    minWidth: Platform.select({
      web: 40,
      default: 34,
    }),
    minHeight: Platform.select({
      web: 40,
      default: 34,
    }),
  },
  pokemonName: {
    marginTop: Platform.select({
      web: 3,
      default: 4,
    }),
    fontSize: Platform.select({
      web: 13,
      default: 10,
    }),
    lineHeight: Platform.select({
      web: 15,
      default: 12,
    }),
    textAlign: "center",
    color: "#4b5563",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptySlotText: {
    fontSize: Platform.select({
      web: 12,
      default: 11,
    }),
    fontWeight: "700",
    color: "#9ca3af",
  },
});