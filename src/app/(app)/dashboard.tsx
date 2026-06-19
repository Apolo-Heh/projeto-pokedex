import { PokemonClient } from "pokenode-ts";
import { useEffect, useMemo, useRef, useState } from "react";

import { Animated, FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/components/alert";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CustomHeader } from "@/components/header";
import { List } from "@/components/list";
import { PokeType } from "@/components/poketype";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";
import { useAuth } from "@/context/AuthContext";
import {
  type CapturedPokemon,
  capturePokemon,
  loadCapturedPokemons,
  removeCapturedPokemon,
} from "../../services/capturedPokemon";
import { Gift, Trash2, X } from "lucide-react-native";

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

const SKELETON_DATA: PokemonCard[] = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: "",
  sprite: "",
  types: [],
}));

function capitalizePokemonName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const SkeletonCard = () => {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
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
  const [capturedPokemons, setCapturedPokemons] = useState<CapturedPokemon[]>([]);
  const [isMutatingPokemonId, setIsMutatingPokemonId] = useState<number | null>(null);
  const [isRemovePickerVisible, setIsRemovePickerVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<CaptureAlertState>({
    title: "",
    message: "",
    type: "success",
  });
  const { userId } = useAuth();

  const capturedPokemonSet = useMemo(
    () => new Set(capturedPokemons.map((capturedPokemon) => capturedPokemon.id)),
    [capturedPokemons],
  );

  const sortedCapturedPokemons = useMemo(
    () => [...capturedPokemons].sort((left, right) => right.capturedAt - left.capturedAt),
    [capturedPokemons],
  );

  const randomCaptureCandidates = useMemo(
    () => pokemon.filter((item) => !capturedPokemonSet.has(item.id)),
    [capturedPokemonSet, pokemon],
  );

  useEffect(() => {
    let isActive = true;

    const loadCaptured = async () => {
      if (!userId) {
        setCapturedPokemons([]);
        return;
      }

      try {
        const capturedPokemonsData = await loadCapturedPokemons(userId);

        if (!isActive) {
          return;
        }

        setCapturedPokemons(capturedPokemonsData);
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

  const handleCaptureRandomPokemon = async () => {
    if (!userId) {
      setAlertData({
        title: "Sessão inválida",
        message: "Faça login novamente para receber um pokémon.",
        type: "error",
      });
      setIsAlertVisible(true);
      return;
    }

    if (isLoading) {
      setAlertData({
        title: "Aguarde",
        message: "Os pokémon ainda estão sendo carregados.",
        type: "warning",
      });
      setIsAlertVisible(true);
      return;
    }

    if (randomCaptureCandidates.length === 0) {
      setAlertData({
        title: "Catálogo completo",
        message: "Você já capturou todos os pokémon carregados nesta página.",
        type: "info",
      });
      setIsAlertVisible(true);
      return;
    }

    const randomPokemon = randomCaptureCandidates[Math.floor(Math.random() * randomCaptureCandidates.length)];

    try {
      setIsMutatingPokemonId(randomPokemon.id);

      const nextCapturedPokemons = await capturePokemon(userId, {
        id: randomPokemon.id,
        name: randomPokemon.name,
        sprite: randomPokemon.sprite,
        type: randomPokemon.types[0] ?? PokeTypes.Normal,
      });

      setCapturedPokemons(nextCapturedPokemons);
      setAlertData({
        title: "Pokémon recebido",
        message: `${capitalizePokemonName(randomPokemon.name)} foi adicionado aos capturados.`,
        type: "success",
      });
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

  const handleOpenRemovePicker = () => {
    if (!userId) {
      setAlertData({
        title: "Sessão inválida",
        message: "Faça login novamente para gerenciar seus capturados.",
        type: "error",
      });
      setIsAlertVisible(true);
      return;
    }

    if (capturedPokemons.length === 0) {
      setAlertData({
        title: "Sem capturados",
        message: "Você ainda não tem pokémon capturados para remover.",
        type: "info",
      });
      setIsAlertVisible(true);
      return;
    }

    setIsRemovePickerVisible(true);
  };

  const handleRemoveCapturedPokemon = async (pokemonId: number) => {
    if (!userId) {
      setIsRemovePickerVisible(false);
      return;
    }

    const pokemonToRemove = capturedPokemons.find((capturedPokemon) => capturedPokemon.id === pokemonId);

    if (!pokemonToRemove) {
      return;
    }

    try {
      setIsMutatingPokemonId(pokemonId);

      const nextCapturedPokemons = await removeCapturedPokemon(userId, pokemonId);
      setCapturedPokemons(nextCapturedPokemons);
      setIsRemovePickerVisible(false);
      setAlertData({
        title: "Pokémon removido",
        message: `${capitalizePokemonName(pokemonToRemove.name)} foi removido dos capturados.`,
        type: "success",
      });
      setIsAlertVisible(true);
    } catch (error) {
      setAlertData({
        title: "Erro",
        message: error instanceof Error ? error.message : "Não foi possível remover o pokémon.",
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

      <View style={styles.pageActions}>

        <View style={styles.actionsRow}>
          <Button
            title={isMutatingPokemonId ? "Processando..." : "Receber aleatório"}
            icon={Gift}
            onPress={handleCaptureRandomPokemon}
            style={styles.primaryActionButton}
            textStyle={styles.primaryActionButtonText}
          />
          <Button
            title="Escolher para remover"
            icon={Trash2}
            onPress={handleOpenRemovePicker}
            style={styles.secondaryActionButton}
            textStyle={styles.secondaryActionButtonText}
          />
        </View>
      </View>

      <List
        data={isLoading ? SKELETON_DATA : pokemon}
        onLoadMore={() => {}}
        listStyle={styles.list}
        renderItemContent={(item) => {
          if (isLoading) {
            return <SkeletonCard />;
          }

          return (
            <View style={styles.cardWrapper}>
              <Card style={[styles.card, { borderColor: PokeTypeStyles[(item.types[0] ?? PokeTypes.Normal) as PokeTypes].color }]}>
                <View style={styles.cardImageContainer}>
                  <Image style={styles.cardImage} source={{ uri: item.sprite }} resizeMode="contain" />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.cardTitle}>{capitalizePokemonName(item.name)}</Text>
                      <Text style={styles.cardSubtitle}>Nº {item.id}</Text>
                    </View>
                  </View>

                  <View style={styles.typesContainer}>
                    {item.types.map((type: PokeTypes) => (
                      <PokeType key={type} type={type} />
                    ))}
                  </View>
                </View>
              </Card>
            </View>
          );
        }}
      />

      <Modal
        visible={isRemovePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsRemovePickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Escolher para remover</Text>
                <Text style={styles.modalSubtitle}>Toque em um pokémon capturado para removê-lo da sua lista.</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setIsRemovePickerVisible(false)} style={styles.modalCloseButton}>
                <X size={18} color="#0f172a" strokeWidth={2.5} />
              </Pressable>
            </View>

            {sortedCapturedPokemons.length === 0 ? (
              <View style={styles.emptyCapturedState}>
                <Text style={styles.emptyCapturedTitle}>Nenhum capturado encontrado</Text>
                <Text style={styles.emptyCapturedSubtitle}>Capture um pokémon primeiro para liberar a remoção.</Text>
              </View>
            ) : (
              <FlatList
                data={sortedCapturedPokemons}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.modalList}
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isMutatingPokemonId === item.id}
                    onPress={() => handleRemoveCapturedPokemon(item.id)}
                    style={styles.modalPokemonRow}>
                    <View style={styles.modalPokemonInfo}>
                      <Image style={styles.modalPokemonImage} source={{ uri: item.sprite }} resizeMode="contain" />
                      <View>
                        <Text style={styles.modalPokemonName}>{capitalizePokemonName(item.name)}</Text>
                        <Text style={styles.modalPokemonMeta}>Nº {item.id}</Text>
                      </View>
                    </View>
                    <Text style={styles.modalRemoveText}>{isMutatingPokemonId === item.id ? "Removendo..." : "Remover"}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

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
  pageActions: {
    gap: 16,
    paddingVertical: 8,
  },
  pageCopy: {
    gap: 6,
  },
  pageTitle: {
    color: "#111827",
    fontSize: 26,
    fontWeight: Platform.select({
      android: "900",
      default: "bold",
    }),
  },
  pageSubtitle: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  primaryActionButton: {
    flex: 1,
    width: "auto",
    backgroundColor: "#2563eb",
  },
  secondaryActionButton: {
    flex: 1,
    width: "auto",
    backgroundColor: "#0f172a",
  },
  primaryActionButtonText: {
    fontSize: 14,
  },
  secondaryActionButtonText: {
    fontSize: 14,
  },
  list: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    flexGrow: 1,
    paddingBottom: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "82%",
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#475569",
    fontSize: 13,
    marginTop: 4,
    maxWidth: 280,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalList: {
    gap: 10,
    paddingBottom: 8,
  },
  modalPokemonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalPokemonInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalPokemonImage: {
    width: 48,
    height: 48,
  },
  modalPokemonName: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  modalPokemonMeta: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  modalRemoveText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyCapturedState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyCapturedTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyCapturedSubtitle: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
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
