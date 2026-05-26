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
import { navigate } from "expo-router/build/global-state/routing";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

export function CustomHeader() {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.header}>
            <Text style={styles.title}>Bem-vindo, {user}</Text>
            <View style={styles.nav}>
                <Button title="Perfil" onPress={() => router.push('/profile')} style={{ width: 100 }}></Button>
                <Button title="Pokedex" onPress={() => router.push('/dashboard')} style={{ width: 100 }}></Button>
                <Button title="Time" onPress={() => router.push('/team')} style={{ width: 100 }}></Button>
            </View>
            <Button title="Sair do APP" onPress={signOut} style={{ width: 120 }} />
        </View>
    )
}

export const styles = StyleSheet.create({
    title: {
        color: "#333",
        fontSize: 18,
        fontWeight: Platform.select({
            android: "800",
            default: "bold",
        }),
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        padding: 15,
        alignItems: "center",


        backgroundColor: "#f0efef",
        borderRadius: 15,
        boxShadow:" rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
    },
    nav: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
    }
});