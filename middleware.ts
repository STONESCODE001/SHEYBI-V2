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
  const { pathname, searchParams } = req.nextUrl

  // Intercept promoter referral links (/f/[promoter] or ?ref=[promoter])
  let promoterSlug: string | null = null

  if (pathname.startsWith("/f/")) {
    const raw = pathname.split("/f/")[1]?.split("/")[0]
    if (raw) {
      promoterSlug = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "")
    }
  } else if (searchParams.has("ref")) {
    const raw = searchParams.get("ref")
    if (raw) {
      promoterSlug = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "")
    }
  }

  if (promoterSlug) {
    const res = pathname.startsWith("/f/")
      ? NextResponse.rewrite(new URL("/", req.url))
      : NextResponse.next()

    res.cookies.set("sheybi_ref", promoterSlug, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
    })

    return res
  }

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
