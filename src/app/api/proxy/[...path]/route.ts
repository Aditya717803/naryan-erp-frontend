import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function proxyRequest(
  request: NextRequest,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  const { path } = await context.params;

  // Get JWT from HttpOnly cookie
  const token = request.cookies.get(
    "naryan_access_token",
  )?.value;

  console.log(
    "AUTH DEBUG:",
    request.nextUrl.pathname,
    token ? "TOKEN FOUND" : "TOKEN MISSING",
  );

  if (!token) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 },
    );
  }

  // Build backend URL
 
const requestPath = `/${path.join("/")}`;

const collectionRoutes = new Set([
  "/customers",
  "/customers/",
  "/products",
  "/inventory",
  "/invoices",
  "/notifications",
  "/states",
  "/manufacture/customers",
  "/manufacture/products",
  "/manufacture/inventory",
  "/manufacture/dashboard",
  "/manufacture/invoices",
]);

const targetPath = collectionRoutes.has(requestPath)
  ? `${requestPath}/`
  : requestPath;

const targetUrl = new URL(
  `${API_BASE}${targetPath}`,
);

console.log("REQUEST PATH:", requestPath);
console.log("TARGET PATH:", targetPath);
  // Preserve query parameters
  request.nextUrl.searchParams.forEach(
    (value, key) => {
      targetUrl.searchParams.set(key, value);
    },
  );

  // Create headers ONCE
  const headers = new Headers();

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  const contentType = request.headers.get(
    "content-type",
  );

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  // Diagnostic
  console.log(
    "\n========== PROXY DIAGNOSTIC ==========",
  );

  console.log(
    "Path:",
    request.nextUrl.pathname,
  );

  console.log(
    "Token exists:",
    !!token,
  );

  console.log(
    "Token length:",
    token.length,
  );

  console.log(
    "Authorization header:",
    headers.has("Authorization"),
  );

  console.log(
    "Target:",
    targetUrl.toString(),
  );

  console.log(
    "Method:",
    request.method,
  );

  console.log(
    "======================================\n",
  );

  // Request body
  let body: BodyInit | undefined;

  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    body = await request.arrayBuffer();
  }

  // Forward request
  const response = await fetch(
    targetUrl,
    {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    },
  );

  console.log(
    "BACKEND RESPONSE:",
    response.status,
    targetUrl.toString(),
  );

  const responseBody =
    await response.arrayBuffer();

  return new NextResponse(
    responseBody,
    {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get(
            "content-type",
          ) ?? "application/json",
      },
    },
  );
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}