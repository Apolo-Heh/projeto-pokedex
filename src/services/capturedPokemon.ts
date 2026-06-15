import AsyncStorage from "@react-native-async-storage/async-storage";
import { PokeTypes } from "@/constants/pokeTypes";

const CAPTURED_BASE_URL = "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/captured";
const STORAGE_KEY_PREFIX = "@pokedex:captured";

export type CapturedPokemon = {
  id: number;
  name: string;
  sprite: string;
  type: PokeTypes;
  capturedAt: number;
};

export type CapturedPokemonInput = Omit<CapturedPokemon, "capturedAt">;

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

async function parseResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

async function requestCapture(method: "PUT" | "DELETE", userId: string, pokemonId: number) {
  const response = await fetch(`${CAPTURED_BASE_URL}?user-id=${encodeURIComponent(userId)}&pokemon-id=${encodeURIComponent(String(pokemonId))}`, {
    method,
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "message" in payload ? String((payload as { message?: unknown }).message) : `Falha na requisição (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

async function readCapturedPokemons(userId: string): Promise<CapturedPokemon[]> {
  const rawData = await AsyncStorage.getItem(storageKey(userId));

  if (!rawData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(rawData) as CapturedPokemon[];

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(
      (pokemon): pokemon is CapturedPokemon =>
        Boolean(
          pokemon &&
            typeof pokemon.id === "number" &&
            typeof pokemon.name === "string" &&
            typeof pokemon.sprite === "string" &&
            typeof pokemon.type === "string" &&
            typeof pokemon.capturedAt === "number",
        ),
    );
  } catch {
    return [];
  }
}

async function writeCapturedPokemons(userId: string, pokemons: CapturedPokemon[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(pokemons));
}

export async function loadCapturedPokemons(userId: string) {
  return readCapturedPokemons(userId);
}

export async function isPokemonCaptured(userId: string, pokemonId: number) {
  const capturedPokemons = await readCapturedPokemons(userId);
  return capturedPokemons.some((pokemon) => pokemon.id === pokemonId);
}

export async function capturePokemon(userId: string, pokemon: CapturedPokemonInput) {
  await requestCapture("PUT", userId, pokemon.id);

  const capturedPokemons = await readCapturedPokemons(userId);
  const nextPokemons = [
    ...capturedPokemons.filter((currentPokemon) => currentPokemon.id !== pokemon.id),
    {
      ...pokemon,
      capturedAt: Date.now(),
    },
  ].sort((left, right) => right.capturedAt - left.capturedAt);

  await writeCapturedPokemons(userId, nextPokemons);

  return nextPokemons;
}

export async function removeCapturedPokemon(userId: string, pokemonId: number) {
  await requestCapture("DELETE", userId, pokemonId);

  const capturedPokemons = await readCapturedPokemons(userId);
  const nextPokemons = capturedPokemons.filter((pokemon) => pokemon.id !== pokemonId);

  await writeCapturedPokemons(userId, nextPokemons);

  return nextPokemons;
}
