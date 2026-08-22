import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(
      "naryan_access_token",
    )?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          detail: "Not authenticated",
        },
        {
          status: 401,
        },
      );
    }

    const response = await fetch(
      `${API_BASE}/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        {
          status: response.status,
        },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Auth me proxy error:", error);

    return NextResponse.json(
      {
        detail: "Unable to get current user",
      },
      {
        status: 500,
      },
    );
  }
}