const AUTH_BASE_URL = "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon/auth/v1";

export type AuthCredentials = {
  username: string;
  password: string;
};

export type AuthResponse = {
  username?: string;
  userId?: string;
  user_id?: string;
  id?: string;
  token?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
};

async function parseResponse(response: Response): Promise<AuthResponse> {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText) as AuthResponse;
  } catch {
    return { message: responseText };
  }
}

function getErrorMessage(payload: AuthResponse, status: number) {
  return payload.message || payload.error || `Falha na requisição (${status})`;
}

async function requestAuth(path: string, credentials: AuthCredentials) {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload;
}

export function login(credentials: AuthCredentials) {
  return requestAuth("/login", credentials);
}

export function register(credentials: AuthCredentials) {
  return requestAuth("/register", credentials);
}
