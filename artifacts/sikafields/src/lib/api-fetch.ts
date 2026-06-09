import { useAuth } from "@clerk/react";

export function useApiClient() {
  const { getToken } = useAuth();
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getToken();
    const base = new Headers(options.headers);
    if (token) base.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, credentials: "include", headers: base });
  };
}
