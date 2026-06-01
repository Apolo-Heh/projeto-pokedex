import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  dateText: {
    fontSize: 16,
    fontWeight: Platform.select({
      android: "800",
      default: "700",
    }),
  },
  resultBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  winBadge: {
    backgroundColor: "#268d2b",
  },
  lossBadge: {
    backgroundColor: "#eb3f3f",
  },
  resultText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#e9e9e9",
  },
  teamsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  teamBlock: {
    width: "48%",
    gap: 10,
  },
  teamLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "700",
    textAlign: "center",
  },
  teamGrid: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  pokemonSlot: {
    borderWidth: 2,
    padding: 4,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pokemonImage: {
    width: 48,
    height: 48,
  },
  skeletonSlot: {
    borderColor: "#E1E9EE",
    backgroundColor: "#E1E9EE",
    minWidth: 58,
    minHeight: 58,
  },
  separator: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },
});
