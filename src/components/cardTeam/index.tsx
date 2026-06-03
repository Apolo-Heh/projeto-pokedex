import { Card } from "@/components/card";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";
import { Pencil, Trash2 } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "./styles";

export type TeamPokemon = {
  id: number;
  name: string;
  sprite: string;
  type: PokeTypes;
};

export type TeamCardData = {
  id: string;
  name: string;
  pokemonIds: number[];
};

type CardTeamProps = {
  team: TeamCardData;
  pokemonCatalog: TeamPokemon[];
  onEdit: () => void;
  onDelete: () => void;
};

export function CardTeam({ team, pokemonCatalog, onEdit, onDelete }: CardTeamProps) {
  const teamMembers = team.pokemonIds
    .map((pokemonId) => pokemonCatalog.find((pokemon) => pokemon.id === pokemonId))
    .filter((pokemon): pokemon is TeamPokemon => Boolean(pokemon));

  const slots = Array.from({ length: 5 }, (_, index) => teamMembers[index] ?? null);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{team.name}</Text>
          <Text style={styles.subtitle}>{teamMembers.length}/5 pokémon</Text>
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onEdit} style={styles.iconButton}>
            <Pencil size={18} color="#7c2d12" strokeWidth={2.4} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onDelete} style={[styles.iconButton, styles.deleteIconButton]}>
            <Trash2 size={18} color="#fff" strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      <View style={styles.teamGrid}>
        {slots.map((pokemon, index) =>
          pokemon ? (
            <View
              key={`${team.id}-${pokemon.id}-${index}`}
              style={[
                styles.pokemonSlot,
                styles.filledSlot,
                { borderColor: PokeTypeStyles[pokemon.type].color },
              ]}
            >
              <Image source={{ uri: pokemon.sprite }} style={styles.pokemonImage} resizeMode="contain" />
              <Text numberOfLines={1} style={styles.pokemonName}>
                {pokemon.name}
              </Text>
            </View>
          ) : (
            <View key={`${team.id}-empty-${index}`} style={[styles.pokemonSlot, styles.emptySlot]}>
              <Text style={styles.emptySlotText}>Vazio</Text>
            </View>
          ),
        )}
      </View>
    </Card>
  );
}