import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleProp, Text, View, ViewProps, ViewStyle } from "react-native";
import { styles } from "./styles";
import { PokemonClient } from "pokenode-ts";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";

interface CardPartidaProps extends ViewProps {
  dataPartida: string | Date;
  vitoria: boolean;
  time: number[];
  timeInimigo: number[];
  style?: StyleProp<ViewStyle>;
}

type PokemonMatchMember = {
  id: number;
  sprite: string;
  type: PokeTypes;
};

const SkeletonSlot = () => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return <Animated.View style={[styles.pokemonSlot, styles.skeletonSlot, { opacity }]} />;
};

export function CardPartida({ dataPartida, vitoria, time, timeInimigo, style, ...rest }: CardPartidaProps) {
  const [timeData, setTimeData] = useState<PokemonMatchMember[]>([]);
  const [timeInimigoData, setTimeInimigoData] = useState<PokemonMatchMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const date = dataPartida instanceof Date ? dataPartida : new Date(dataPartida);
  const dataFormatada = Number.isNaN(date.getTime())
    ? String(dataPartida)
    : date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });

  useEffect(() => {
    let isActive = true;

    const getPokemonData = async (id: number): Promise<PokemonMatchMember> => {
      const api = new PokemonClient();
      const pokemon = await api.getPokemonById(id);

      return {
        id: pokemon.id,
        sprite: pokemon.sprites.other?.["official-artwork"].front_default ?? pokemon.sprites.front_default ?? "",
        type: (pokemon.types[0]?.type.name ?? PokeTypes.Normal) as PokeTypes,
      };
    };

    const loadMatchData = async () => {
      try {
        setIsLoading(true);
        const [playerTeam, enemyTeam] = await Promise.all([
          Promise.all(time.slice(0, 5).map((pokemonId) => getPokemonData(pokemonId))),
          Promise.all(timeInimigo.slice(0, 5).map((pokemonId) => getPokemonData(pokemonId))),
        ]);

        if (!isActive) return;

        setTimeData(playerTeam);
        setTimeInimigoData(enemyTeam);
      } catch (error) {
        console.error(error);
        if (isActive) {
          setTimeData([]);
          setTimeInimigoData([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadMatchData();

    return () => {
      isActive = false;
    };
  }, [time, timeInimigo]);

  return (
    <View style={[styles.card, { borderColor: vitoria ? styles.winBorder.borderColor : styles.lossBorder.borderColor }, style]} {...rest}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{dataFormatada}</Text>
        </View>

        <View style={[styles.resultBadge, vitoria ? styles.winBadge : styles.lossBadge]}>
          <Text style={styles.resultText}>{vitoria ? "Vitória" : "Derrota"}</Text>
        </View>
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamLabel}>Seu time</Text>
          <View style={styles.teamGrid}>
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => <SkeletonSlot key={`team-skeleton-${index}`} />)
              : timeData.map((pokemon) => (
                  <View
                    key={pokemon.id}
                    style={[styles.pokemonSlot, { borderColor: PokeTypeStyles[pokemon.type].color }]}>
                    <Image source={{ uri: pokemon.sprite }} style={styles.pokemonImage} resizeMode="contain" />
                  </View>
                ))}
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.teamBlock}>
          <Text style={styles.teamLabel}>Inimigo</Text>
          <View style={styles.teamGrid}>
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => <SkeletonSlot key={`enemy-skeleton-${index}`} />)
              : timeInimigoData.map((pokemon) => (
                  <View
                    key={pokemon.id}
                    style={[styles.pokemonSlot, { borderColor: PokeTypeStyles[pokemon.type].color }]}>
                    <Image source={{ uri: pokemon.sprite }} style={styles.pokemonImage} resizeMode="contain" />
                  </View>
                ))}
          </View>
        </View>
      </View>
    </View>
  );
}
