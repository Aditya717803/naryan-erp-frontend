import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function serverApiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "naryan_access_token",
  )?.value;

  if (!token) {
    return new Response(
      JSON.stringify({
        detail: "Not authenticated",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const headers = new Headers(
    options.headers,
  );

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  return fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers,
      cache: "no-store",
    },
  );
}