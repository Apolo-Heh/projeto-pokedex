import { CustomHeader } from "@/components/header";
import { View, Text, StyleSheet, Platform } from "react-native";


export default function Profile() {
    return (
        <View style={styles.container}>
            <CustomHeader />
            <View style={styles.contentContainer}>
                <View style={styles.contentIn}>
                    <View style={styles.containerNome}>
                        <Text>
                            Nome
                        </Text>
                    </View>
                    <View style={styles.containerPartidas}>
                        <Text>
                            Partidas
                        </Text>
                    </View>
                    <View style={styles.containerVitorias}>
                        <Text>
                            Vitórias
                        </Text>
                    </View>
                    <View style={styles.containerDerrotas}>
                        <Text>
                            Derrotas
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
export const styles = StyleSheet.create({
    container: {
        padding: 32,
        gap: 8,
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    contentIn: {
        width:"80%",
    },
    containerNome: {

    },
    containerPartidas: {

    },
    containerVitorias: {

    },
    containerDerrotas: {

    }
});