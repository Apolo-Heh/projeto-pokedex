import { CustomHeader } from "@/components/header";
import { View, Text, StyleSheet, Platform } from "react-native";


export default function Profile() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CustomHeader></CustomHeader>
            </View>
            <View style={styles.content}>
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
        borderColor:"red",
        borderWidth:5,
    },
    header: {
        height:100,
        borderColor:"blue",
        borderWidth:5,
    },
    content: {
        borderColor:"green",
        borderWidth:5,
    },
    contentIn: {
        marginHorizontal: "auto",
        width:"80%",
        borderColor:"purple",
        borderWidth:5
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