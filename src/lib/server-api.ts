import { cookies } from "next/headers";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const API_BASE = "/api/proxy";

export async function serverApiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  return fetch(`${APP_URL}${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(cookieHeader
        ? {
            Cookie: cookieHeader,
          }
        : {}),
    },
    cache: "no-store",
  });
}