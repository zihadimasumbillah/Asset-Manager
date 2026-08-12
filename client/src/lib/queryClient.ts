import { QueryClient, type QueryFunction } from "@tanstack/react-query";

import { ensureSessionKey } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const sessionKey = await ensureSessionKey();
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (sessionKey) {
    headers["Authorization"] = `Bearer ${sessionKey}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0];
    if (typeof url !== "string") {
      throw new Error(
        `[queryClient] Invalid queryKey: first element must be a URL string, got ${typeof url}`
      );
    }

    const sessionKey = await ensureSessionKey();
    const headers: Record<string, string> = {};
    if (sessionKey) {
      headers["Authorization"] = `Bearer ${sessionKey}`;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      // [FIX-M1] Re-fetch when the user returns to the tab.
      // Financial data must not be silently stale for hours.
      refetchOnWindowFocus: true,
      // [FIX-M1] 2-minute stale time — reasonable for a financial dashboard.
      // Previously: Infinity — data fetched once was never re-fetched unless invalidated.
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes before GC
      gcTime: 10 * 60 * 1000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
