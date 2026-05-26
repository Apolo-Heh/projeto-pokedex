import { useEffect, useState, useRef } from "react";
import { PokemonClient } from "pokenode-ts";

import { View, Text, StyleSheet, Platform, Image, Animated } from "react-native";
import { List } from "@/components/list";

import { Card } from "@/components/card";
import { PokeType } from "@/components/poketype";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";
import { CustomHeader } from "@/components/header";

type PokemonCard = {
  id: number;
  name: string;
  sprite: string;
  types: PokeTypes[];
};

// 1. Increased skeleton count to 12
const SKELETON_DATA: PokemonCard[] = Array.from({ length: 12 }, (_, i) => ({
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
      ])
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

          return (
            <Card
              style={[
                styles.card,
                { borderColor: PokeTypeStyles[(item.types[0] ?? PokeTypes.Normal) as PokeTypes].color },
              ]}>
              <Image style={styles.cardImage} source={{ uri: item.sprite }} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>Nº {item.id}</Text>
                <View style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {item.types.map((type: PokeTypes) => (
                    <PokeType key={type} type={type} />
                  ))}
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    padding: 32,
    gap: 8,
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
  },
  card: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    paddingBlock: 6,
    paddingInline: 18,
    borderRadius: 12,
    borderWidth: 2,
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
  cardImage: {
    width: 120,
    height: 120,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
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