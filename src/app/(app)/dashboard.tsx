import { PokemonClient } from "pokenode-ts";
import { useEffect, useMemo, useRef, useState } from "react";

import { List } from "@/components/list";
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card";
import { CustomHeader } from "@/components/header";
import { PokeType } from "@/components/poketype";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";
import { Alert } from "@/components/alert";
import { useAuth } from "@/context/AuthContext";
import { capturePokemon, loadCapturedPokemons, removeCapturedPokemon } from "../../services/capturedPokemon";
import { Plus, Trash2 } from "lucide-react-native";

type PokemonCard = {
  id: number;
  name: string;
  sprite: string;
  types: PokeTypes[];
};

type CaptureAlertState = {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

// 1. Increased skeleton count to 50
const SKELETON_DATA: PokemonCard[] = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: "",
  sprite: "",
  types: [],
}));

// 2. Extracted Skeleton into its own component to handle the animation lifecycle
const SkeletonCard = () => {
  // Initialize opacity at 0.5
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Loop a sequence that pulses opacity from 0.5 up to 1, then back down
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim]);

  return (
    // Wrap the card in Animated.View to apply the pulsing opacity
    <Animated.View style={[styles.card, styles.skeletonCard, { opacity: fadeAnim }]}>
      <View style={[styles.cardImage, styles.skeletonPlaceholder]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonLine, { width: 120, height: 24 }]} />
        <View style={[styles.skeletonLine, { width: 50, height: 16 }]} />
        <View style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <View style={[styles.skeletonLine, { width: 70, height: 24, borderRadius: 8 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

export default function Dashboard() {
  const [pokemon, setPokemon] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [capturedPokemonIds, setCapturedPokemonIds] = useState<number[]>([]);
  const [isMutatingPokemonId, setIsMutatingPokemonId] = useState<number | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<CaptureAlertState>({
    title: "",
    message: "",
    type: "success",
  });
  const { userId } = useAuth();

  const capturedPokemonSet = useMemo(() => new Set(capturedPokemonIds), [capturedPokemonIds]);

  useEffect(() => {
    let isActive = true;

    const loadCaptured = async () => {
      if (!userId) {
        setCapturedPokemonIds([]);
        return;
      }

      try {
        const capturedPokemons = await loadCapturedPokemons(userId);

        if (!isActive) {
          return;
        }

        setCapturedPokemonIds(capturedPokemons.map((capturedPokemon) => capturedPokemon.id));
      } catch (error) {
        console.error(error);
      }
    };

    loadCaptured();

    return () => {
      isActive = false;
    };
  }, [userId]);

  useEffect(() => {
    let isActive = true;
    const previousOverflowY = Platform.OS === "web" ? document.body.style.overflowY : "";

    if (Platform.OS === "web") {
      document.body.style.overflowY = "auto";
    }

    const loadPokemon = async () => {
      try {
        setIsLoading(true);
        const api = new PokemonClient();
        const list = await api.listPokemons(0, 150);
        const details = await Promise.all(list.results.map(({ name }) => api.getPokemonByName(name)));

        if (!isActive) return;

        setPokemon(
          details.map((item) => ({
            id: item.id,
            name: item.name,
            sprite: item.sprites.other?.["official-artwork"].front_default ?? item.sprites.front_default ?? "",
            types: item.types.map((type) => type.type.name as PokeTypes),
          })),
        );
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPokemon();

    return () => {
      isActive = false;

      if (Platform.OS === "web") {
        document.body.style.overflowY = previousOverflowY;
      }
    };
  }, []);

  const handleCaptureToggle = async (item: PokemonCard) => {
    if (!userId) {
      setAlertData({
        title: "Sessão inválida",
        message: "Faça login novamente para capturar pokémon.",
        type: "error",
      });
      setIsAlertVisible(true);
      return;
    }

    try {
      setIsMutatingPokemonId(item.id);

      if (capturedPokemonSet.has(item.id)) {
        const nextCapturedPokemons = await removeCapturedPokemon(userId, item.id);
        setCapturedPokemonIds(nextCapturedPokemons.map((capturedPokemon) => capturedPokemon.id));
        setAlertData({
          title: "Pokémon removido",
          message: `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} foi removido dos capturados.`,
          type: "success",
        });
      } else {
        const nextCapturedPokemons = await capturePokemon(userId, {
          id: item.id,
          name: item.name,
          sprite: item.sprite,
          type: item.types[0] ?? PokeTypes.Normal,
        });
        setCapturedPokemonIds(nextCapturedPokemons.map((capturedPokemon) => capturedPokemon.id));
        setAlertData({
          title: "Pokémon capturado",
          message: `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} foi capturado com sucesso.`,
          type: "success",
        });
      }

      setIsAlertVisible(true);
    } catch (error) {
      setAlertData({
        title: "Erro",
        message: error instanceof Error ? error.message : "Não foi possível atualizar a captura.",
        type: "error",
      });
      setIsAlertVisible(true);
    } finally {
      setIsMutatingPokemonId(null);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader />
      <List
        data={isLoading ? SKELETON_DATA : pokemon}
        onLoadMore={() => {}}
        listStyle={styles.list}
        renderItemContent={(item) => {
          // 3. Render the new Animated Skeleton Component
          if (isLoading) {
            return <SkeletonCard />;
          }

          const isCaptured = capturedPokemonSet.has(item.id);

          return (
            <View style={styles.cardWrapper}>
              <Card
                style={[
                  styles.card,
                  { borderColor: PokeTypeStyles[(item.types[0] ?? PokeTypes.Normal) as PokeTypes].color },
                  isCaptured && styles.cardCaptured,
                ]}>
                <View style={styles.cardImageContainer}>
                  <Image style={styles.cardImage} source={{ uri: item.sprite }} resizeMode="contain" />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.cardTitle}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
                      <Text style={styles.cardSubtitle}>Nº {item.id}</Text>
                    </View>

                    <View style={[styles.captureBadge, isCaptured ? styles.captureBadgeActive : styles.captureBadgeInactive]}>
                      <Text style={[styles.captureBadgeText, isCaptured ? styles.captureBadgeTextActive : styles.captureBadgeTextInactive]}>
                        {isCaptured ? "Capturado" : "Livre"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.typesContainer}>
                    {item.types.map((type: PokeTypes) => (
                      <PokeType key={type} type={type} />
                    ))}
                  </View>
                </View>
              </Card>

              <Pressable
                accessibilityRole="button"
                disabled={isMutatingPokemonId === item.id}
                onPress={() => handleCaptureToggle(item)}
                style={[styles.captureButton, isCaptured ? styles.removeButton : styles.addButton]}>
                {isCaptured ? <Trash2 size={16} color="#fff" strokeWidth={2.5} /> : <Plus size={16} color="#fff" strokeWidth={2.5} />}
                <Text style={styles.captureButtonText}>
                  {isMutatingPokemonId === item.id ? "Processando..." : isCaptured ? "Remover capturado" : "Capturar"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />

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

export const styles = StyleSheet.create({
  container: {
    padding: 32,
    gap: 8,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    color: "#333",
    fontSize: 18,
    fontWeight: Platform.select({
      android: "800",
      default: "bold",
    }),
  },
  list: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    flexGrow: 1,
  },
  cardWrapper: {
    gap: 10,
    width: Platform.select({
      web: 380,
      default: 320,
    }),
  },
  card: {
    display: "flex",
    flexDirection: "row",
    width: Platform.select({
      web: 380,
      default: 320,
    }),
    maxWidth: 380,
    minHeight: 140,
    paddingBlock: 6,
    paddingInline: 18,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  cardCaptured: {
    backgroundColor: "#fffaf0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: Platform.select({
      android: "900",
      default: "bold",
    }),
    color: "#2e2d2d",
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  cardImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flex: 1,
    justifyContent: "flex-start",
  },
  typesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    height: 56,
  },
  captureBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  captureBadgeActive: {
    backgroundColor: "#dcfce7",
  },
  captureBadgeInactive: {
    backgroundColor: "#e2e8f0",
  },
  captureBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  captureBadgeTextActive: {
    color: "#166534",
  },
  captureBadgeTextInactive: {
    color: "#334155",
  },
  captureButton: {
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  addButton: {
    backgroundColor: "#16a34a",
  },
  removeButton: {
    backgroundColor: "#dc2626",
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  skeletonCard: {
    borderColor: "#E1E9EE",
    backgroundColor: "#F5F7F8",
  },
  skeletonPlaceholder: {
    backgroundColor: "#E1E9EE",
    borderRadius: 8,
  },
  skeletonLine: {
    backgroundColor: "#E1E9EE",
    borderRadius: 4,
  },
});
