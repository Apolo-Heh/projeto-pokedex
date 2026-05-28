import { View, Text } from "react-native";
import { Button } from "@/components/button";

import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { styles } from "./styles";
import { LogOut } from "lucide-react-native";

export function CustomHeader() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Bem-vindo, {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}</Text>
      <View style={styles.nav}>
        <Button title="Perfil" onPress={() => router.push("/profile")} style={styles.button}></Button>
        <Button title="Pokedex" onPress={() => router.push("/dashboard")} style={styles.button}></Button>
        <Button title="Time" onPress={() => router.push("/team")} style={styles.button}></Button>
      </View>
      <Button
        title="Sair do APP"
        onPress={signOut}
        style={styles.loggoutButton}
        icon={LogOut}
        textStyle={styles.loggoutButtonText}
      />
    </View>
  );
}
