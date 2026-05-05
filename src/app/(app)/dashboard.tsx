import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { View, Text, StyleSheet, Platform } from "react-native";
import { Button } from "@/components/button";
import { List } from "@/components/list";
import { Image } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/card";
import { PokeType } from "@/components/poketype";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const pokemon = [
    {
      id: 1,
      name: "bulbasaur",
      types: ["grass", "poison"],
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    },
    {
      id: 4,
      name: "charmander",
      types: ["fire"],
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    },
    {
      id: 7,
      name: "squirtle",
      types: ["water"],
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    },
    {
      id: 25,
      name: "pikachu",
      types: ["electric"],
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    },
    {
      id: 133,
      name: "eevee",
      types: ["normal"],
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    },
  ];

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
          <Card style={[styles.card, { borderColor: PokeTypeStyles[item.types[0] as PokeTypes].color }]}>
            <Image style={styles.cardImage} source={{ uri: item.sprite }} width={120} height={120} />
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
