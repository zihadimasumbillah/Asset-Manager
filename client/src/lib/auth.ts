const SESSION_KEY_KEY = "finpulse_session_key";

export function getSessionKey(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY_KEY);
  if (stored && stored.length > 0) {
    return stored;
  }
  return null;
}

export async function validateSessionKey(key: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createSession(username: string, password: string): Promise<string> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: "Login failed" }))) as {
      message?: string;
    };
    throw new Error(err.message || "Login failed");
  }

  const data = (await res.json()) as { sessionKey: string };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY_KEY, data.sessionKey);
  }
  return data.sessionKey;
}

export async function ensureSessionKey(): Promise<string | null> {
  const stored = getSessionKey();
  if (stored) {
    const isValid = await validateSessionKey(stored);
    if (isValid) {
      return stored;
    }
    clearSession();
  }

  try {
    return await createSession("demo", "demo-password");
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY_KEY);
  }
}
