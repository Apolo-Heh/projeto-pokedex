import { CustomHeader } from "@/components/header";
import { StyleSheet, Text, View } from "react-native";

export default function Team(){
    return(
        <View style={styles.container}>
            <CustomHeader/>
            <View style={styles.contentContainer}>
                <Text>TELA DE TIME</Text>
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
});