import { PokeTypes } from "@/constants/pokeTypes";

const CAPTURED_BASE_URL = "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/pokemon/v1/captured";

type ApiCapturedPokemon = {
  id?: number;
  index?: number | string;
  name?: string;
  image?: string;
  sprite?: string;
  types?: unknown;
  type?: unknown;
  capturedAt?: number | string;
};

type ApiCapturedResponse = {
  capture?: unknown;
  captured?: unknown;
  data?: unknown;
  pokemons?: unknown;
};

export type CapturedPokemon = {
  id: number;
  name: string;
  sprite: string;
  type: PokeTypes;
  capturedAt: number;
};

export type CapturedPokemonInput = Omit<CapturedPokemon, "capturedAt">;

const capturedPokemonCache = new Map<string, CapturedPokemon[]>();

function isPokeType(value: unknown): value is PokeTypes {
  return typeof value === "string" && Object.values(PokeTypes).includes(value as PokeTypes);
}

function toPokemonId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedId = Number.parseInt(value, 10);

    if (Number.isFinite(parsedId)) {
      return parsedId;
    }
  }

  return null;
}

function extractCapturedEntries(payload: unknown): ApiCapturedPokemon[] {
  if (Array.isArray(payload)) {
    return payload as ApiCapturedPokemon[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const typedPayload = payload as ApiCapturedResponse;
  const possibleCollections = [typedPayload.capture, typedPayload.captured, typedPayload.data, typedPayload.pokemons];

  for (const collection of possibleCollections) {
    if (Array.isArray(collection)) {
      return collection as ApiCapturedPokemon[];
    }
  }

  return [];
}

function normalizeCapturedPokemon(entry: ApiCapturedPokemon): CapturedPokemon | null {
  const id = toPokemonId(entry.id ?? entry.index);
  const name = typeof entry.name === "string" ? entry.name : null;
  const sprite = typeof entry.sprite === "string" ? entry.sprite : typeof entry.image === "string" ? entry.image : null;

  if (!id || !name || !sprite) {
    return null;
  }

  const types = Array.isArray(entry.types)
    ? entry.types.filter(isPokeType)
    : isPokeType(entry.type)
      ? [entry.type]
      : [];

  return {
    id,
    name,
    sprite,
    type: types[0] ?? PokeTypes.Normal,
    capturedAt: typeof entry.capturedAt === "number" ? entry.capturedAt : Date.now(),
  };
}

function normalizeCapturedResponse(payload: unknown) {
  return extractCapturedEntries(payload)
    .map(normalizeCapturedPokemon)
    .filter((pokemon): pokemon is CapturedPokemon => Boolean(pokemon));
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
  const response = await fetch(
    `${CAPTURED_BASE_URL}?user-id=${encodeURIComponent(userId)}&pokemon-id=${encodeURIComponent(String(pokemonId))}`,
    {
      method,
      headers: {
        Accept: "application/json",
      },
    },
  );

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : `Falha na requisição (${response.status})`;

    throw new Error(message);
  }

  return payload;
}

async function requestCapturedPokemons(userId: string) {
  const response = await fetch(`${CAPTURED_BASE_URL}?user-id=${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 404) {
      return capturedPokemonCache.get(userId) ?? [];
    }

    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : `Falha na requisição (${response.status})`;

    throw new Error(message);
  }

  return normalizeCapturedResponse(payload);
}

export async function loadCapturedPokemons(userId: string) {
  const capturedPokemons = await requestCapturedPokemons(userId);

  capturedPokemonCache.set(userId, capturedPokemons);

  return capturedPokemons;
}

export async function isPokemonCaptured(userId: string, pokemonId: number) {
  const capturedPokemons = await loadCapturedPokemons(userId);
  return capturedPokemons.some((pokemon) => pokemon.id === pokemonId);
}

export async function capturePokemon(userId: string, pokemon: CapturedPokemonInput) {
  const payload = await requestCapture("PUT", userId, pokemon.id);
  const capturedPokemons = normalizeCapturedResponse(payload);

  capturedPokemonCache.set(userId, capturedPokemons);

  return capturedPokemons;
}

export async function removeCapturedPokemon(userId: string, pokemonId: number) {
  const payload = await requestCapture("DELETE", userId, pokemonId);
  const capturedPokemons = normalizeCapturedResponse(payload);

  capturedPokemonCache.set(userId, capturedPokemons);

  return capturedPokemons;
}
