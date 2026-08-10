import { QueryClient, type QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // [FIX-M2] The URL is always the first element of the queryKey.
    // Additional elements are cache-differentiation keys, NOT URL path segments.
    // The previous queryKey.join("/") produced wrong URLs for multi-element keys
    // and was typed as `readonly unknown[]` — entirely unsafe.
    const url = queryKey[0];
    if (typeof url !== "string") {
      throw new Error(
        `[queryClient] Invalid queryKey: first element must be a URL string, got ${typeof url}`
      );
    }

    const res = await fetch(url, {
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
