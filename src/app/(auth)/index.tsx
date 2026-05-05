import { use, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { Alert } from "@/components/alert";

export default function Index() {
  const [name, setName] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });

  const { signIn } = useAuth();

  function validateCredentials() {
    if ((name.toLowerCase() === "lucas" && senha === "123") || (name.toLowerCase() === "admin" && senha === "admin")) {
      signIn(name);

      router.push({
        pathname: "/dashboard",
        params: { username: name.toLowerCase() },
      });
    } else {
      setAlertData({
        title: "Erro de Login",
        message: "Credenciais inválidas. Tente novamente.",
        type: "error",
      });
      setIsAlertVisible(true);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Image source={require("@assets/images/pokebola.png")} style={{ width: 200, height: 200 }} />
        <Text style={styles.title}>Login</Text>
        <Input placeholder="Usuario" onChangeText={setName} />
        <Input placeholder="Senha" secureTextEntry onChangeText={setSenha} />
        <Button title="Enviar" onPress={validateCredentials} style={{ marginTop: 20 }} />
      </Card>

      <Alert
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        visible={isAlertVisible}
        onClose={() => setIsAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  container: {
    backgroundColor: "#702029",
    backgroundImage: "linear-gradient(312deg,rgba(36, 73, 158, 1) 0%, rgba(122, 27, 27, 1) 74%)",
    flex: 1,
    padding: 32,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    color: "#333",
    fontSize: 48,
    padding: 16,
    fontWeight: "bold",
    marginBlock: 12,
  },
});
