const memStore = new Map<string, string>();
const SafeStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memStore.has(key) ? memStore.get(key)! : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    memStore.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    memStore.delete(key);
  },
};

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_URL = (
  configuredUrl || "https://eclipsi-pi-backend-ptcv.onrender.com"
).replace(/\/+$/, "");

export const AUTH_TOKEN_KEY = "eclipsi_auth_token";

let sessionVersion = 0;
let sessionWrite = Promise.resolve();
let signedOut = false;
let logoutVersion: number | undefined;
const sessionListeners = new Set<() => void>();

export function getSessionVersion(): number {
  return sessionVersion;
}

function notifySessionChange() {
  sessionVersion++;
  sessionListeners.forEach((listener) => listener());
}

export function subscribeAuthSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => { sessionListeners.delete(listener); };
}

export async function getAuthToken(): Promise<string | null> {
  await sessionWrite;
  return signedOut ? null : SafeStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): Promise<void> {
  const write = sessionWrite.then(async () => {
    await SafeStorage.setItem(AUTH_TOKEN_KEY, token);
    signedOut = false;
    notifySessionChange();
  });
  sessionWrite = write.catch(() => undefined);
  return write;
}

export function isLocalLogout(version: number): boolean {
  return version === logoutVersion;
}

export function clearAuthSession({ logout = false } = {}): Promise<void> {
  if (logout) logoutVersion = sessionVersion + 1;
  signedOut = true;
  const write = sessionWrite.then(async () => {
    signedOut = true;
    await SafeStorage.removeItem(AUTH_TOKEN_KEY);
  });
  sessionWrite = write.catch(() => undefined);
  setProfileAvatar(null);
  notifySessionChange();
  return write;
}

export function observeBrowserSession() {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return () => {};
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return () => {};
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return () => {};
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return;
    if (event.key !== AUTH_TOKEN_KEY && event.key !== null) return;
    signedOut = event.newValue === null;
    setProfileAvatar(null);
    notifySessionChange();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

let avatarListeners = new Set<(uri: string | null) => void>();
let currentAvatar: string | null = null;

export function subscribeProfileAvatar(listener: (uri: string | null) => void): () => void {
  avatarListeners.add(listener);
  listener(currentAvatar);
  return () => { avatarListeners.delete(listener); };
}

export function setProfileAvatar(uri: string | null): void {
  if (signedOut && uri !== null) return;
  currentAvatar = uri;
  avatarListeners.forEach((listener) => listener(uri));
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(data: unknown, status: number): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (status >= 500) return "O servidor indisponivel. Tente novamente.";
  if (status === 409) return "Este horario ja esta ocupado.";
  if (status === 401) return "Sua sessao expirou. Entre novamente.";
  if (status === 403) return "Voce nao tem permissao para esta operacao.";
  if (status === 404) return "Recurso nao encontrado.";
  if (status >= 400) return "A requisicao foi recusada.";
  return "Nao foi possivel concluir a requisicao.";
}

export async function api<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      "API_URL nao configurada. Defina EXPO_PUBLIC_API_URL no ambiente.",
      0,
    );
  }

  if (!path.startsWith("/")) {
    throw new ApiError("O caminho da API deve comecar com '/'.", 0);
  }

  const rawHeaders: Record<string, string> = { Accept: "application/json" };
  if (init?.headers) {
    Object.entries(init.headers as Record<string, string>).forEach(([k, v]) => {
      if (v !== undefined) rawHeaders[k] = String(v);
    });
  }
  const version = getSessionVersion();
  const hasAuth = Object.keys(rawHeaders).some((k) => k.toLowerCase() === "authorization");
  const usesStoredSession = !hasAuth && !path.startsWith("/api/v1/auth/");
  const token = usesStoredSession ? await getAuthToken() : null;
  if (version !== getSessionVersion() && usesStoredSession) {
    throw new ApiError("Sua sessao mudou. Tente novamente.", 0);
  }
  if (token) rawHeaders["Authorization"] = `Bearer ${token}`;
  if (init?.body && !Object.keys(rawHeaders).some((k) => k.toLowerCase() === "content-type")) {
    rawHeaders["Content-Type"] = "application/json";
  }
  const headers = rawHeaders;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: unknown = null;

    if (token && version !== getSessionVersion()) {
      throw new ApiError("Sua sessao mudou. Tente novamente.", 0);
    }

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      if (response.status === 401 && token) {
        void clearAuthSession().catch(() => undefined);
      }
      throw new ApiError(getErrorMessage(data, response.status), response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw new ApiError("A requisicao excedeu o tempo limite.", 0);
    }
    throw new ApiError("Nao foi possivel conectar ao servidor.", 0);
  } finally {
    clearTimeout(timeout);
  }
}
