import React, { useEffect, useMemo, useState } from "react";
import { PokemonClient } from "pokenode-ts";
import { CardPartida } from "@/components/cardPartida";
import { Card } from "@/components/card";
import { CustomHeader } from "@/components/header";
import { useAuth } from "@/context/AuthContext";
import { View, Text, Image, StyleSheet, Platform, ScrollView, Pressable, LayoutChangeEvent, TextInput } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Search } from "lucide-react-native";
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { PokeType } from "@/components/poketype";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";

type PokemonCard = {
  id: number;
  name: string;
  sprite: string;
  types: PokeTypes[];
};

type TabLabelProps = {
  index: number;
  activeIndex: SharedValue<number>;
  children: string;
};

type TabIconProps = {
  color: string;
};

function MatchesIcon({ color }: TabIconProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 7h12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M6 12h12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M6 17h12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="4" cy="7" r="1.5" fill={color} />
      <Circle cx="4" cy="12" r="1.5" fill={color} />
      <Circle cx="4" cy="17" r="1.5" fill={color} />
    </Svg>
  );
}

function CaptureIcon({ color }: TabIconProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={2} />
      <Path d="M4 12h16" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="12" cy="12" r="2.5" fill={color} />
    </Svg>
  );
}

function AccountIcon({ color }: TabIconProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={2} />
      <Path
        d="M5.5 19c1.7-3 4-4.5 6.5-4.5S16.3 16 18.5 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TabIcon({ index, isActive }: { index: number; isActive: boolean }) {
  const color = isActive ? "#ffffff" : "#333333";

  return (
    <View style={styles.tabIcon}>
      {index === 0 && <MatchesIcon color={color} />}
      {index === 1 && <CaptureIcon color={color} />}
      {index === 2 && <AccountIcon color={color} />}
    </View>
  );
}

function TabLabel({ index, activeIndex, children }: TabLabelProps) {
  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      activeIndex.value,
      [index - 1, index, index + 1],
      ["#333333", "#ffffff", "#333333"]
    );

    return {
      color,
    };
  });

  return <Animated.Text style={[styles.tabText, animatedTextStyle]}>{children}</Animated.Text>;
}

function TabItem({
  index,
  isActive,
  activeIndex,
  children,
}: {
  index: number;
  isActive: boolean;
  activeIndex: SharedValue<number>;
  children: string;
}) {
  return (
    <View style={styles.tabContent}>
      <TabIcon index={index} isActive={isActive} />
      <TabLabel index={index} activeIndex={activeIndex}>
        {children}
      </TabLabel>
    </View>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"partidas" | "capturados" | "conta">("partidas");
  const [tabWidths, setTabWidths] = useState<number[]>([0, 0, 0]);
  const [tabPositions, setTabPositions] = useState<number[]>([0, 0, 0]);
  const animatedX = useSharedValue(0);
  const animatedTabIndex = useSharedValue(0);
  const [capturedPokemons, setCapturedPokemons] = useState<PokemonCard[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCapturedLoading, setIsCapturedLoading] = useState(false);
  const [hasLoadedCaptured, setHasLoadedCaptured] = useState(false);

  const tabOrder = ["partidas", "capturados", "conta"];
  const currentTabIndex = tabOrder.indexOf(tab);

  const filteredCapturedPokemons = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return capturedPokemons;
    }

    return capturedPokemons.filter((pokemon) => pokemon.name.toLowerCase().includes(normalizedSearch));
  }, [capturedPokemons, searchText]);

  useEffect(() => {
    animatedTabIndex.value = withTiming(currentTabIndex, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });

    if (tabPositions[currentTabIndex] !== undefined) {
      animatedX.value = withTiming(tabPositions[currentTabIndex], {
        duration: 150,
        easing: Easing.inOut(Easing.ease),
      });
    }
  }, [currentTabIndex, tabPositions]);

  useEffect(() => {
    if (tab !== "capturados" || hasLoadedCaptured) {
      return;
    }

    let isActive = true;

    const loadCapturedPokemons = async () => {
      try {
        setIsCapturedLoading(true);

        const api = new PokemonClient();
        const list = await api.listPokemons(0, 150);
        const shuffledResults = [...list.results];

        for (let index = shuffledResults.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [shuffledResults[index], shuffledResults[randomIndex]] = [shuffledResults[randomIndex], shuffledResults[index]];
        }

        const selectedResults = shuffledResults.slice(0, 5);
        const details = await Promise.all(selectedResults.map(({ name }) => api.getPokemonByName(name)));

        if (!isActive) {
          return;
        }

        setCapturedPokemons(
          details.map((item) => ({
            id: item.id,
            name: item.name,
            sprite: item.sprites.other?.["official-artwork"].front_default ?? item.sprites.front_default ?? "",
            types: item.types.map((type) => type.type.name as PokeTypes),
          })),
        );
        setHasLoadedCaptured(true);
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) {
          setIsCapturedLoading(false);
        }
      }
    };

    loadCapturedPokemons();

    return () => {
      isActive = false;
    };
  }, [tab, hasLoadedCaptured]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animatedX.value }],
  }));

  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = x;
      return newPositions;
    });
    setTabWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.containerNome}>
          <Image
            source={{
              uri: "https://static.wikia.nocookie.net/deathbattle/images/1/1c/Portrait.ashketchum.png/revision/latest/thumbnail/width/360/height/450?cb=20240426202222",
            }}
            style={styles.imagem}
          />
          <Text style={{ fontSize: 32, fontWeight: 700, textAlign: "center" }}>
            {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}
          </Text>
        </View>
        <View>
          <View style={styles.tabBar}>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  width: tabWidths[0] || 0,
                },
                animatedStyle,
              ]}
            />
            <Pressable
              style={[styles.tabButton, tab === "partidas" && styles.tabButtonActive]}
              onPress={() => setTab("partidas")}
              onLayout={handleTabLayout(0)}
            >
              <TabItem index={0} isActive={tab === "partidas"} activeIndex={animatedTabIndex}>
                Partidas
              </TabItem>
            </Pressable>
            <Pressable
              style={[styles.tabButton, tab === "capturados" && styles.tabButtonActive]}
              onPress={() => setTab("capturados")}
              onLayout={handleTabLayout(1)}
            >
              <TabItem index={1} isActive={tab === "capturados"} activeIndex={animatedTabIndex}>
                Capturados
              </TabItem>
            </Pressable>
            <Pressable
              style={[styles.tabButton, tab === "conta" && styles.tabButtonActive]}
              onPress={() => setTab("conta")}
              onLayout={handleTabLayout(2)}
            >
              <TabItem index={2} isActive={tab === "conta"} activeIndex={animatedTabIndex}>
                Conta
              </TabItem>
            </Pressable>
          </View>

          {tab === "partidas" && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginHorizontal: "auto"}}>
                Histórico de partidas recentes
              </Text>
              <View style={styles.containerPartidas}>
                <CardPartida
                  style={styles.cardPartidas}
                  dataPartida={new Date()}
                  vitoria={true}
                  time={[25, 6, 9, 149, 131]}
                  timeInimigo={[94, 130, 143, 150, 248]}
                />
                <CardPartida
                  style={styles.cardPartidas}
                  dataPartida={new Date()}
                  vitoria={true}
                  time={[68, 634, 3, 159, 12]}
                  timeInimigo={[4, 187, 135, 127, 286]}
                />
                <CardPartida
                  style={styles.cardPartidas}
                  dataPartida={new Date()}
                  vitoria={false}
                  time={[865, 739, 667, 125, 4]}
                  timeInimigo={[123, 655, 578, 832, 468]}
                />
              </View>
            </View>
          )}

          {tab === "capturados" && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginHorizontal: "auto"}}>
                Pokémons capturados
              </Text>
              <View style={[styles.searchBox, isSearchFocused && styles.searchBoxFocused]}>
                <Search size={18} color="#9ca3af" strokeWidth={2.5} />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Pesquisar pokémon"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  underlineColorAndroid="transparent"
                  style={styles.searchInput}
                />
              </View>

              {isCapturedLoading ? (
                <Text style={styles.emptyStateText}>Carregando pokémons capturados...</Text>
              ) : filteredCapturedPokemons.length > 0 ? (
                <View style={styles.capturedGrid}>
                  {filteredCapturedPokemons.map((pokemon) => (
                    <Card
                      key={pokemon.id}
                      style={[
                        styles.pokemonCard,
                        {
                          borderColor: PokeTypeStyles[(pokemon.types[0] ?? PokeTypes.Normal) as PokeTypes].color,
                        },
                      ]}
                    >
                      <View style={styles.cardImageContainer}>
                        <Image style={styles.cardImage} source={{ uri: pokemon.sprite }} resizeMode="contain" />
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
                        <Text style={styles.cardSubtitle}>Nº {pokemon.id}</Text>
                        <View style={styles.typesContainer}>
                          {pokemon.types.map((type) => (
                            <PokeType key={type} type={type} />
                          ))}
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyStateText}>Nenhum pokémon encontrado para essa busca.</Text>
              )}
            </View>
          )}

          {tab === "conta" && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginHorizontal: "auto"}}>
                Configurações e informações da conta
              </Text>
              <Text style={{ fontSize: 18, marginBottom: 8 }}>
                Usuário: {user ? user.charAt(0).toUpperCase() + user.slice(1) : ""}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    marginInline: "auto",
    paddingBlock: 32,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    maxWidth: 800,
    width: "100%",
  },
  cardPartidas: {
    width: "100%",
    maxWidth: 760,
  },
  pokemonCard: {
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
  imagem: {
    backgroundColor: "red",
    width: 120,
    height: 120,
    borderRadius: 200,
  },
  containerNome: {
    display: "flex",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#ffffff",
    padding: 0,
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  tabIndicator: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#e53b3d",
    borderRadius: 8,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonActive: {
    // Background removido - agora é feito pelo indicador animado
  },
  tabText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    backgroundColor: "#fafafa",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchBoxFocused: {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
    outlineColor: "transparent",
  },
  capturedGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    width: "100%",
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
  typesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    height: 56,
  },
  emptyStateText: {
    fontSize: 18,
    textAlign: "center",
  },
  containerPartidas: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
});
