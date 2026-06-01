import { CardPartida } from "@/components/cardPartida";
import { CustomHeader } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { View, Text, Image, StyleSheet, Platform } from "react-native";

export default function Profile() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <CustomHeader />
      <View style={styles.content}>
        <View style={styles.containerNome}>
          <Image
            source={{
              uri: "https://static.wikia.nocookie.net/deathbattle/images/1/1c/Portrait.ashketchum.png/revision/latest/thumbnail/width/360/height/450?cb=20240426202222",
            }}
            style={styles.imagem}
          />
          <Text style={{ fontSize: 32, fontWeight: 700, textAlign: "center" }}>
            {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Partidas</Text>
          <View style={styles.containerPartidas}>
            <CardPartida
              style={styles.cardPartidas}
              dataPartida={new Date()}
              vitoria={true}
              time={[25, 6, 9, 149, 131]}
              timeInimigo={[94, 130, 143, 150, 248]}
            />
            <CardPartida
              style={styles.cardPartidas}
              dataPartida={new Date()}
              vitoria={true}
              time={[68, 634, 3, 159, 12]}
              timeInimigo={[4, 187, 135, 127, 286]}
            />
            <CardPartida
              style={styles.cardPartidas}
              dataPartida={new Date()}
              vitoria={false}
              time={[865, 739, 667, 125, 4]}
              timeInimigo={[123, 655, 578, 832, 468]}
            />
          </View>
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
    gap: 10,
    maxWidth: 800,
    width: "100%",
  },
  cardPartidas: {
    width: "100%",
    maxWidth: 760,
  },
  imagem: {
    backgroundColor: "red",
    width: 120,
    height: 120,
    borderRadius: 200,
  },
  containerNome: {
    display: "flex",
    alignItems: "center",
  },
  containerPartidas: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
});
