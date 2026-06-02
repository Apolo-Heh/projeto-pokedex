import { useRef, useState } from "react";
import { Animated, Modal, Platform, Pressable, Text, View } from "react-native";
import { Button } from "@/components/button";

import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { styles } from "./styles";
import { LogOut, Menu } from "lucide-react-native";

export function CustomHeader() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuScale = useRef(new Animated.Value(1)).current;

  const animateMenuTrigger = (toValue: number) => {
    Animated.spring(menuScale, {
      toValue,
      useNativeDriver: true,
      speed: 24,
      bounciness: 8,
    }).start();
  };

  const navigateTo = (path: "/profile" | "/dashboard" | "/team") => {
    setMenuOpen(false);
    router.push(path);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Bem-vindo, {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}</Text>
      {Platform.OS === "android" ? (
        <View style={styles.androidActions}>
          <Animated.View style={{ transform: [{ scale: menuScale }] }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMenuOpen((current) => !current)}
              onPressIn={() => animateMenuTrigger(0.9)}
              onPressOut={() => animateMenuTrigger(1)}
              style={styles.menuTrigger}>
              <Menu size={22} color="#333" strokeWidth={2.5} />
            </Pressable>
          </Animated.View>

          <Button
            title=""
            onPress={signOut}
            style={styles.loggoutButtonIconOnly}
            icon={LogOut}
            textStyle={styles.loggoutButtonText}
          />

          <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
            <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
              <View style={styles.menuCard}>
                <Pressable accessibilityRole="button" onPress={() => navigateTo("/profile")} style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Perfil</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => navigateTo("/dashboard")} style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Pokedex</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => navigateTo("/team")} style={styles.menuItem}>
                  <Text style={styles.menuItemText}>Time</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </View>
      ) : (
        <View style={styles.nav}>
          <Button title="Perfil" onPress={() => router.push("/profile")} style={styles.button}></Button>
          <Button title="Pokedex" onPress={() => router.push("/dashboard")} style={styles.button}></Button>
          <Button title="Time" onPress={() => router.push("/team")} style={styles.button}></Button>
        </View>
      )}
      {Platform.OS === "web" ? (
        <Button
          title="Sair do APP"
          onPress={signOut}
          style={styles.loggoutButton}
          icon={LogOut}
          textStyle={styles.loggoutButtonText}
        />
      ) : null}
    </View>
  );
}
