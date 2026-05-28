import { CustomHeader } from "@/components/header";
import { View, Text, StyleSheet, Platform } from "react-native";

export default function Profile() {
  return (
    <View style={styles.container}>
      <CustomHeader />
      <View style={styles.content}>
        <View style={styles.containerNome}>
          <Text>Nome</Text>
        </View>
        <View style={styles.containerPartidas}>
          <Text>Partidas</Text>
        </View>
        <View style={styles.containerVitorias}>
          <Text>Vitórias</Text>
        </View>
        <View style={styles.containerDerrotas}>
          <Text>Derrotas</Text>
        </View>
      </View>
    </View>
  );
}
export const styles = StyleSheet.create({
  container: {
    padding: 32,
    gap: 8,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    marginInline: "auto",
    paddingBlock: 32,
    display: "flex",
    justifyContent: "center",
    maxWidth: 800,
    width: "100%",
  },
  containerNome: {
    display: "flex",
    justifyContent: "center",
  },
  containerPartidas: {
    display: "flex",
    justifyContent: "center",
  },
  containerVitorias: {
    display: "flex",
    justifyContent: "center",
  },
  containerDerrotas: {
    display: "flex",
    justifyContent: "center",
  },
});
