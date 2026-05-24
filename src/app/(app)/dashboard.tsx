import { useEffect, useState } from "react";
import { PokemonClient } from "pokenode-ts";

import { View, Text, StyleSheet, Platform } from "react-native";
import { Button } from "@/components/button";
import { List } from "@/components/list";
import { Image } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/card";
import { PokeType } from "@/components/poketype";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";

type PokemonCard = {
  id: number;
  name: string;
  sprite: string;
  types: PokeTypes[];
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [pokemon, setPokemon] = useState<PokemonCard[]>([]);

  useEffect(() => {
    let isActive = true;
    const previousOverflowY = Platform.OS === "web" ? document.body.style.overflowY : "";

    if (Platform.OS === "web") {
      document.body.style.overflowY = "auto";
    }

    const loadPokemon = async () => {
      const api = new PokemonClient();
      const list = await api.listPokemons(0, 150);
      const details = await Promise.all(list.results.map(({ name }) => api.getPokemonByName(name)));

      if (!isActive) {
        return;
      }

      setPokemon(
        details.map((item) => ({
          id: item.id,
          name: item.name,
          sprite: item.sprites.other?.["official-artwork"].front_default ?? item.sprites.front_default ?? "",
          types: item.types.map((type) => type.type.name as PokeTypes),
        })),
      );
    };

    loadPokemon().catch((error) => console.error(error));

    return () => {
      isActive = false;

      if (Platform.OS === "web") {
        document.body.style.overflowY = previousOverflowY;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo, {user}</Text>
        <Button title="Sair do APP" onPress={signOut} style={{ width: 120 }} />
      </View>
      <List
        data={pokemon}
        onLoadMore={() => {}}
        listStyle={styles.list}
        renderItemContent={(item) => (
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
        )}
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
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
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
});
