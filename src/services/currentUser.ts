const STATS_BASE_URL =
  "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1/stats";

export type UserStats = {
  userId: string;
  username: string;
  level: number;
  vitorias: number;
  derrotas: number;
};

const statsCache = new Map<string, UserStats>();

async function parseResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function normalizeStats(payload: unknown): UserStats | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const data = (root.data ?? root.stats ?? root) as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    userId: String(data.userId ?? data.id ?? ""),
    username: String(data.username ?? data.name ?? ""),
    level: Number(data.level ?? 0),
    vitorias: Number(data.vitorias ?? 0),
    derrotas: Number(data.derrotas ?? 0),
  };
}

async function requestStats(
  method: "GET" | "PUT",
  userId: string,
  bodyPayload?: Partial<Omit<UserStats, "userId">>
) {
  const url = `${STATS_BASE_URL}/${userId}`;

  const options: RequestInit = {
    method,
    headers: {
      Accept: "application/json",
    },
  };

  if (method === "PUT" && bodyPayload) {
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify(bodyPayload);
  }

  const response = await fetch(url, options);
  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 404) {
      return statsCache.get(userId) ?? null;
    }

    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : `Falha na requisição de stats (${response.status})`;

    throw new Error(message);
  }

  return normalizeStats(payload);
}

export async function loadUserStats(userId: string): Promise<UserStats | null> {
  if (!userId) return null;

  const stats = await requestStats("GET", userId);

  if (stats) {
    statsCache.set(userId, stats);
  }

  return stats;
}

export async function updateUserStats(
  userId: string,
  newStats: Partial<Omit<UserStats, "userId">>
): Promise<UserStats | null> {
  if (!userId) return null;

  const updatedStats = await requestStats("PUT", userId, newStats);

  if (updatedStats) {
    statsCache.set(userId, updatedStats);
  }

  return updatedStats;
}