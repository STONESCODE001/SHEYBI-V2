import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/portfolio(.*)",
  "/wallet(.*)",
  "/profile(.*)",
  "/settings(.*)",
])

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Protect standard user routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Protect admin section
  if (isAdminRoute(req)) {
    await auth.protect()
    
    // Check session claims metadata role first
    let role = (sessionClaims?.metadata as { role?: string })?.role ||
               (sessionClaims?.publicMetadata as { role?: string })?.role ||
               (sessionClaims?.public_metadata as { role?: string })?.role

    // Fallback: Query live Clerk user publicMetadata if not in session claims
    if (role !== "admin" && userId) {
      try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        role = (user.publicMetadata as { role?: string })?.role
      } catch (err) {
        console.error("[Middleware] Error fetching Clerk user metadata:", err)
      }
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
