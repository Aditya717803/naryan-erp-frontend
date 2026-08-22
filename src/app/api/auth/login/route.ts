import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${API_BASE}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: body.user_id,
          password: body.password,
        }),
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          detail:
            data.detail ??
            "Invalid User ID or Password",
        },
        {
          status: response.status,
        },
      );
    }

    const nextResponse = NextResponse.json({
      success: true,
    });

    nextResponse.cookies.set(
      "naryan_access_token",
      data.access_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      },
    );

    return nextResponse;
  } catch (error) {
    console.error("Login proxy error:", error);

    return NextResponse.json(
      {
        detail: "Unable to connect to authentication server.",
      },
      {
        status: 500,
      },
    );
  }
}