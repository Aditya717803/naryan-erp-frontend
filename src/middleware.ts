import {NextRequest ,  NextResponse } from "next/server" 

const PUBLIC_PATH = [
    "/"
];


export  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if(PUBLIC_PATH.includes(pathname)){
        return NextResponse.next();
    }


    if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

    const token = request.cookies.get(
    "naryan_access_token",
  )?.value;


   if (!token) {
    const loginUrl = new URL(
      "/",
      request.url,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run middleware on all application routes
     * except static files.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
