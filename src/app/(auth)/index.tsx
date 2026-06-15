import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { Alert } from "@/components/alert";
import { login } from "../../services/authApi";

export default function Index() {
  const [name, setName] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });

  const { signIn } = useAuth();

  async function validateCredentials() {
    const username = name.trim();

    if (!username || !senha) {
      setAlertData({
        title: "Campos obrigatórios",
        message: "Informe usuário e senha para continuar.",
        type: "error",
      });
      setIsAlertVisible(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login({ username, password: senha });
      const responseUsername = (response.username as string | undefined) ?? username;
      const responseUserId = (response.userId as string | undefined) ?? (response.user_id as string | undefined) ?? (response.id as string | undefined) ?? null;

      await signIn(responseUsername, responseUserId);

      router.replace("/dashboard");
    } catch (error) {
      setAlertData({
        title: "Erro de Login",
        message: error instanceof Error ? error.message : "Não foi possível autenticar.",
        type: "error",
      });
      setIsAlertVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Image source={require("@assets/images/pokebola.png")} style={{ width: 200, height: 200 }} />
        <Text style={styles.title}>Login</Text>
        <Input placeholder="Usuario" onChangeText={setName} />
        <Input placeholder="Senha" secureTextEntry onChangeText={setSenha} />
        <Pressable onPress={() => router.push("/signIn")}>
          <Text style={{ color: "#0000ff", fontSize: 14, fontWeight: "bold" }}>Não possui uma conta? Cadastre-se.</Text>
        </Pressable>
        <Button title={isSubmitting ? "Entrando..." : "Enviar"} onPress={validateCredentials} disabled={isSubmitting} />
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
    marginVertical: 12,
  },
});
