import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" || path === "/register" || path === "/";

  // Check if user is authenticated (has user data in cookies)
  const isAuthenticated = request.cookies.has("user");

  // Allow access to home page regardless of auth status
  if (path === "/") {
    return NextResponse.next();
  }

  // Redirect logic for other paths
  if (isPublicPath && isAuthenticated) {
    // If user is authenticated and tries to access login/register, redirect to profile
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    // If user is not authenticated and tries to access protected route, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|static|[\\w-]+\\.\\w+).*)",
  ],
};
