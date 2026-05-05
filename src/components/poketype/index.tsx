import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";

interface PokeTypeProps {
  type: PokeTypes;
}

export const PokeType: React.FC<PokeTypeProps> = ({ type }) => {
  const style = PokeTypeStyles[type];
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: style.color,
        },
      ]}>
      <Text style={styles.text}>{typeLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    width: 100,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
