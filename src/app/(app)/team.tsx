import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/button";
import { CardTeam, TeamCardData, TeamPokemon } from "@/components/cardTeam";
import { CustomHeader } from "@/components/header";
import { PokeTypes, PokeTypeStyles } from "@/constants/pokeTypes";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { loadCapturedPokemons } from "../../services/capturedPokemon";

const STORAGE_KEY = "@pokedex:teams";
const MAX_TEAM_SIZE = 5;

type StoredTeam = TeamCardData & {
    createdAt: number;
};

export default function Team() {
    const { userId } = useAuth();
    const [pokemonCatalog, setPokemonCatalog] = useState<TeamPokemon[]>([]);
    const [teams, setTeams] = useState<StoredTeam[]>([]);
    const [isCatalogLoading, setIsCatalogLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [teamModalVisible, setTeamModalVisible] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [deleteTeam, setDeleteTeam] = useState<StoredTeam | null>(null);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState("");
    const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadTeams = async () => {
            try {
                const rawTeams = await AsyncStorage.getItem(STORAGE_KEY);

                if (!isActive || !rawTeams) {
                    setIsHydrated(true);
                    return;
                }

                const parsedTeams = JSON.parse(rawTeams) as StoredTeam[];

                if (Array.isArray(parsedTeams)) {
                    setTeams(
                        parsedTeams
                            .filter((team) => team && typeof team.id === "string" && typeof team.name === "string")
                            .map((team) => ({
                                ...team,
                                pokemonIds: Array.isArray(team.pokemonIds)
                                    ? team.pokemonIds.filter((pokemonId): pokemonId is number => typeof pokemonId === "number")
                                    : [],
                                createdAt: typeof team.createdAt === "number" ? team.createdAt : Date.now(),
                            })),
                    );
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isActive) {
                    setIsHydrated(true);
                }
            }
        };

        loadTeams();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(teams)).catch((error) => console.error(error));
    }, [teams, isHydrated]);

    useEffect(() => {
        let isActive = true;

        const loadPokemonCatalog = async () => {
            try {
                setIsCatalogLoading(true);
                if (!userId) {
                    if (isActive) {
                        setPokemonCatalog([]);
                    }
                    return;
                }

                if (!isActive) {
                    return;
                }

                const capturedPokemons = await loadCapturedPokemons(userId);

                if (!isActive) {
                    return;
                }

                setPokemonCatalog(
                    capturedPokemons.map((pokemon) => ({
                        id: pokemon.id,
                        name: pokemon.name,
                        sprite: pokemon.sprite,
                        type: pokemon.type,
                    })),
                );
            } catch (error) {
                console.error(error);
            } finally {
                if (isActive) {
                    setIsCatalogLoading(false);
                }
            }
        };

        loadPokemonCatalog();

        return () => {
            isActive = false;
        };
    }, [userId]);

    const filteredPokemon = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return pokemonCatalog;
        }

        return pokemonCatalog.filter((pokemon) => pokemon.name.toLowerCase().includes(normalizedSearch));
    }, [pokemonCatalog, searchTerm]);

    const selectedPokemon = useMemo(() => {
        return selectedPokemonIds
            .map((pokemonId) => pokemonCatalog.find((pokemon) => pokemon.id === pokemonId))
            .filter((pokemon): pokemon is TeamPokemon => Boolean(pokemon));
    }, [pokemonCatalog, selectedPokemonIds]);

    const openCreateTeamModal = () => {
        setEditingTeamId(null);
        setTeamName("");
        setSelectedPokemonIds([]);
        setSearchTerm("");
        setPickerVisible(false);
        setTeamModalVisible(true);
    };

    const openEditTeamModal = (team: StoredTeam) => {
        setEditingTeamId(team.id);
        setTeamName(team.name);
        setSelectedPokemonIds(team.pokemonIds.slice(0, MAX_TEAM_SIZE));
        setSearchTerm("");
        setPickerVisible(false);
        setTeamModalVisible(true);
    };

    const closeTeamModal = () => {
        setTeamModalVisible(false);
        setPickerVisible(false);
        setDeleteTeam(null);
        setEditingTeamId(null);
        setTeamName("");
        setSelectedPokemonIds([]);
        setSearchTerm("");
    };

    const handlePickPokemon = (pokemonId: number) => {
        if (selectedPokemonIds.includes(pokemonId)) {
            return;
        }

        if (selectedPokemonIds.length >= MAX_TEAM_SIZE) {
            setPickerVisible(false);
            setTeamModalVisible(true);
            return;
        }

        setSelectedPokemonIds((current) => [...current, pokemonId]);
        setPickerVisible(false);
    };

    const handleRemovePokemon = (pokemonId: number) => {
        setSelectedPokemonIds((current) => current.filter((currentId) => currentId !== pokemonId));
    };

    const handleSaveTeam = () => {
        const cleanedName = teamName.trim();

        if (!cleanedName) {
            setTeamModalVisible(true);
            return;
        }

        if (selectedPokemonIds.length === 0) {
            setTeamModalVisible(true);
            return;
        }

        const teamToSave: StoredTeam = {
            id: editingTeamId ?? String(Date.now()),
            name: cleanedName,
            pokemonIds: selectedPokemonIds.slice(0, MAX_TEAM_SIZE),
            createdAt: editingTeamId ? teams.find((team) => team.id === editingTeamId)?.createdAt ?? Date.now() : Date.now(),
        };

        setTeams((currentTeams) => {
            if (editingTeamId) {
                return currentTeams.map((team) => (team.id === editingTeamId ? teamToSave : team));
            }

            return [teamToSave, ...currentTeams];
        });

        closeTeamModal();
    };

    const handleDeleteTeam = (team: StoredTeam) => {
        setDeleteTeam(team);
    };

    const confirmDeleteTeam = () => {
        if (!deleteTeam) {
            return;
        }

        setTeams((currentTeams) => currentTeams.filter((currentTeam) => currentTeam.id !== deleteTeam.id));
        setDeleteTeam(null);
    };

    return (
        <View style={styles.container}>
            <CustomHeader />

            <FlatList
                data={teams}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.pageHeader}>
                        <View style={styles.headerCopy}>
                            <Text style={styles.pageTitle}>Times</Text>
                            <Text style={styles.pageSubtitle}>
                                Monte, salve e edite times com até 5 pokémon capturados. Os dados ficam armazenados no dispositivo.
                            </Text>
                        </View>

                        <Button title="Novo time" icon={Plus} onPress={openCreateTeamModal} style={styles.createButton} />
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>{isCatalogLoading ? "Carregando capturados..." : "Nenhum time criado ainda"}</Text>
                        <Text style={styles.emptyText}>
                            Use o botão acima para criar um time e selecionar apenas os pokémon que você já capturou.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <CardTeam
                        team={item}
                        pokemonCatalog={pokemonCatalog}
                        onEdit={() => openEditTeamModal(item)}
                        onDelete={() => handleDeleteTeam(item)}
                    />
                )}
            />

            <Modal transparent visible={teamModalVisible} animationType="fade" onRequestClose={closeTeamModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{editingTeamId ? "Editar time" : "Novo time"}</Text>
                                <Text style={styles.modalSubtitle}>Escolha um nome e até 5 pokémon capturados.</Text>
                            </View>

                            <Pressable accessibilityRole="button" onPress={closeTeamModal} style={styles.closeButton}>
                                <X size={18} color="#4b5563" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        <TextInput
                            value={teamName}
                            onChangeText={setTeamName}
                            placeholder="Nome do time"
                            placeholderTextColor="#9ca3af"
                            style={styles.teamInput}
                        />

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setPickerVisible(true)}
                            style={[styles.selectButton, selectedPokemonIds.length >= MAX_TEAM_SIZE && styles.selectButtonDisabled]}>
                            <View>
                                <Text style={styles.selectButtonTitle}>Selecionar pokémon</Text>
                                <Text style={styles.selectButtonSubtitle}>{selectedPokemonIds.length}/5 selecionados</Text>
                            </View>
                            <ChevronDown size={20} color="#7c2d12" strokeWidth={2.5} />
                        </Pressable>

                        <View style={styles.selectedList}>
                            {selectedPokemon.length === 0 ? (
                                <Text style={styles.selectedEmpty}>Nenhum pokémon selecionado ainda.</Text>
                            ) : (
                                selectedPokemon.map((pokemon) => (
                                    <Pressable key={pokemon.id} onPress={() => handleRemovePokemon(pokemon.id)} style={styles.selectedChip}>
                                        <Image source={{ uri: pokemon.sprite }} style={styles.selectedChipImage} resizeMode="contain" />
                                        <Text numberOfLines={1} style={styles.selectedChipText}>
                                            {pokemon.name}
                                        </Text>
                                        <X size={14} color="#7c2d12" strokeWidth={2.5} />
                                    </Pressable>
                                ))
                            )}
                        </View>

                        <Button
                            title={editingTeamId ? "Salvar alterações" : "Criar time"}
                            onPress={handleSaveTeam}
                            style={styles.saveButton}
                        />
                    </View>
                </View>
            </Modal>

            <Modal transparent visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerCard}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Selecionar pokémon</Text>
                                <Text style={styles.modalSubtitle}>Toque em um item capturado para adicioná-lo ao time.</Text>
                            </View>

                            <Pressable accessibilityRole="button" onPress={() => setPickerVisible(false)} style={styles.closeButton}>
                                <X size={18} color="#4b5563" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        <View style={styles.searchBox}>
                            <Search size={18} color="#9ca3af" strokeWidth={2.5} />
                            <TextInput
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                placeholder="Buscar por nome"
                                placeholderTextColor="#9ca3af"
                                style={styles.searchInput}
                            />
                        </View>

                        <FlatList
                            data={filteredPokemon}
                            keyExtractor={(item) => String(item.id)}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.pickerListContent}
                            ListEmptyComponent={
                                <Text style={styles.emptyPicker}>
                                    {isCatalogLoading ? "Carregando pokémon capturados..." : "Nenhum pokémon capturado encontrado."}
                                </Text>
                            }
                            renderItem={({ item }) => {
                                const isSelected = selectedPokemonIds.includes(item.id);

                                return (
                                    <Pressable
                                        accessibilityRole="button"
                                        disabled={isSelected}
                                        onPress={() => handlePickPokemon(item.id)}
                                        style={[styles.pokemonRow, isSelected && styles.pokemonRowSelected]}>
                                        <View style={styles.pokemonRowImageWrap}>
                                            <Image source={{ uri: item.sprite }} style={styles.pokemonRowImage} resizeMode="contain" />
                                        </View>

                                        <View style={styles.pokemonRowTextWrap}>
                                            <Text style={styles.pokemonRowTitle}>{item.name}</Text>
                                            <Text style={styles.pokemonRowSubtitle}>Nº {item.id}</Text>
                                        </View>

                                        <View style={[styles.pokemonTypeBadge, { backgroundColor: PokeTypeStyles[item.type].color }]}>
                                            <Text style={styles.pokemonTypeText}>{item.type}</Text>
                                        </View>

                                        {isSelected ? <Check size={18} color="#15803d" strokeWidth={2.6} /> : null}
                                    </Pressable>
                                );
                            }}
                        />
                    </View>
                </View>
            </Modal>

            <Modal transparent visible={Boolean(deleteTeam)} animationType="fade" onRequestClose={() => setDeleteTeam(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteCard}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Deletar time</Text>
                                <Text style={styles.modalSubtitle}>
                                    {deleteTeam ? `Deseja excluir o time ${deleteTeam.name}?` : "Confirme a exclusão do time."}
                                </Text>
                            </View>

                            <Pressable accessibilityRole="button" onPress={() => setDeleteTeam(null)} style={styles.closeButton}>
                                <X size={18} color="#4b5563" strokeWidth={2.5} />
                            </Pressable>
                        </View>

                        <View style={styles.deleteActions}>
                            <Button title="Cancelar" onPress={() => setDeleteTeam(null)} style={styles.cancelDeleteButton} />
                            <Button title="Deletar" onPress={confirmDeleteTeam} style={styles.confirmDeleteButton} />
                        </View>
                    </View>
                </View>
            </Modal>
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
    listContent: {
        gap: 16,
        paddingBottom: 32,
    },
    pageHeader: {
        gap: 16,
        marginBottom: 4,
    },
    headerCopy: {
        gap: 6,
    },
    pageTitle: {
        fontSize: 28,
        color: "#1f2937",
        fontWeight: Platform.select({
            android: "900",
            default: "800",
        }),
    },
    pageSubtitle: {
        fontSize: 15,
        lineHeight: 21,
        color: "#4b5563",
        maxWidth: 720,
    },
    createButton: {
        alignSelf: "flex-start",
    },
    emptyState: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        color: "#1f2937",
        fontWeight: "800",
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.54)",
        padding: 20,
        justifyContent: "center",
    },
    modalCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        gap: 16,
        maxHeight: "88%",
    },
    pickerCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        gap: 16,
        maxHeight: "92%",
    },
    deleteCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        gap: 16,
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    modalTitle: {
        fontSize: 20,
        color: "#111827",
        fontWeight: "800",
    },
    modalSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: "#6b7280",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    teamInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#fafafa",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#111827",
    },
    selectButton: {
        borderRadius: 18,
        backgroundColor: "#fff7ed",
        borderWidth: 1,
        borderColor: "#fdba74",
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    selectButtonDisabled: {
        opacity: 0.9,
    },
    selectButtonTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#7c2d12",
    },
    selectButtonSubtitle: {
        marginTop: 2,
        fontSize: 12,
        color: "#9a3412",
    },
    selectedList: {
        gap: 10,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    selectedEmpty: {
        fontSize: 13,
        color: "#6b7280",
    },
    selectedChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#fdba74",
        backgroundColor: "#fff7ed",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    selectedChipImage: {
        width: 26,
        height: 26,
    },
    selectedChipText: {
        maxWidth: 140,
        fontSize: 12,
        color: "#7c2d12",
        fontWeight: "700",
        textTransform: "capitalize",
    },
    saveButton: {
        marginTop: 4,
    },
    deleteActions: {
        flexDirection: "row",
        gap: 12,
    },
    cancelDeleteButton: {
        flex: 1,
        backgroundColor: "#e5e7eb",
    },
    confirmDeleteButton: {
        flex: 1,
        backgroundColor: "#dc2626",
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
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        padding: 0,
    },
    pickerListContent: {
        gap: 10,
        paddingBottom: 8,
    },
    emptyPicker: {
        paddingVertical: 20,
        textAlign: "center",
        color: "#6b7280",
    },
    pokemonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 18,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 12,
    },
    pokemonRowSelected: {
        opacity: 0.68,
    },
    pokemonRowImageWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    pokemonRowImage: {
        width: 34,
        height: 34,
    },
    pokemonRowTextWrap: {
        flex: 1,
        gap: 2,
    },
    pokemonRowTitle: {
        fontSize: 15,
        color: "#111827",
        fontWeight: "800",
        textTransform: "capitalize",
    },
    pokemonRowSubtitle: {
        fontSize: 12,
        color: "#6b7280",
        fontWeight: "600",
    },
    pokemonTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        minWidth: 76,
        alignItems: "center",
    },
    pokemonTypeText: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "800",
        textTransform: "capitalize",
    },
});