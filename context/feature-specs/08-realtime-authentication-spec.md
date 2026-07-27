# Feature Specification: Real-Time User Authentication

> **Feature Target**: Real-Time User Authentication with Clerk  
> **Status**: Draft / Spec  
> **Target Version**: 3.4.0  
> **File Location**: `context/feature-specs/08-realtime-authentication-spec.md`  

---

## 1. Goal

The goal of this feature is to integrate Clerk Authentication into the Sheybi application to manage user identities, session persistence, route protection, and admin access control seamlessly.

### Core Objectives
1. **User Sign In & Sign Out**: Users can register (Sign Up) and log in (Sign In) using **Email and Password** authentication flows.
2. **Session & Profile Management**: Enable user profile customization (avatar, display name, password update) using Clerk pre-built components.
3. **Route & Layout Protection**: Enforce authentication boundaries across desktop and mobile application layouts.
4. **Admin Role Authorization**: Restrict access to all `/admin` routes so that only users with an **Admin** role can enter.
5. **Seamless UI Shell Integration**: Replace placeholder profile controls in the Desktop Sidebar and Mobile Navigation with Clerk's `<UserButton />` and `<UserProfile />` components.

---

## 2. Design

### Auth State & Route Accessibility
The application pages are dynamically protected based on user authentication state:

- **Auth Pages (`/auth/sign-in`, `/auth/sign-up`)**: Publicly accessible. Automatically redirect logged-in users to the main feed (`/`).
- **Protected User Routes (`/portfolio`, `/wallet`, `/profile`, `/settings`)**: Restricted to authenticated users. Unauthenticated attempts are intercepted by Next.js Middleware and redirected to `/auth/sign-in` with a `redirect_url` return parameter.
- **Admin Section (`/admin/*`)**: Strictly protected. Accessible ONLY to authenticated users who possess the `admin` role. Unauthorized users attempting to access `/admin` will receive a `403 Forbidden` error page or be redirected to `/`.
- **Public Feed / Market Pages (`/`, `/markets`, `/market/[id]`, `/legal/*`)**: Read-only view is available to guests, but interactive actions (e.g. placing predictions, opening wallet, submitting market suggestions) trigger sign-in prompts.

### UI Component Design Rules

#### Desktop Sidebar Integration
- In the `UserProfileRegion` component ([components/shell/user-profile-region.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/components/shell/user-profile-region.tsx)):
  - **Unauthenticated State (`<SignedOut>`)**: Renders clean, styled "Log In" and "Sign up" action buttons.
  - **Authenticated State (`<SignedIn>`)**: Replaces static user avatars and text with Clerk's `<UserButton />`, configured with custom appearance tokens matching Sheybi's `#0F1727` surface background and `#0D47FF` / `#FFC107` accents.

#### Mobile Navigation & Profile Integration
- In `BottomNavigation` ([components/shell/bottom-navigation.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/components/shell/bottom-navigation.tsx)):
  - Tapping the **Profile** tab in the mobile bottom bar navigates to `/profile`.
  - On `/profile`, the page renders Clerk's `<UserProfile routing="hash" />` embedded cleanly inside the mobile viewport container, or triggers a bottom-sheet drawer containing `<UserProfile />`.

---

## 3. Implementation

The implementation is broken down into 7 logical steps:

### 3.1 Environment & Configuration Setup

Configure environment variables in `.env.local` for Clerk integration:

```env
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

### 3.2 Root Layout Provider Wrap

Wrap the entire app layout inside `<ClerkProvider>` within [app/layout.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/app/layout.tsx):

```tsx
import { ClerkProvider } from "@clerk/nextjs"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4F46E5",
          colorBackground: "#0F1727",
          colorText: "#FFFFFF",
          colorInputBackground: "#1B2436",
          colorInputText: "#FFFFFF",
        },
      }}
    >
      <html lang="en" className="dark h-full antialiased">
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <DialogProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </DialogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

---

### 3.3 Middleware & Route Protection (`middleware.ts`)

Create `middleware.ts` in the project root using `clerkMiddleware()` and `createRouteMatcher()`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
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
    
    // Admin Role check (Approach 1: Metadata Check)
    const role = (sessionClaims?.metadata as { role?: string })?.role
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
```

---

### 3.4 Sign In & Sign Up Pages

Replace static form placeholders in [app/auth/sign-in/page.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/app/auth/sign-in/page.tsx) and [app/auth/sign-up/page.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/app/auth/sign-up/page.tsx) with Clerk's standard auth components:

#### `app/auth/sign-in/[[...sign-in]]/page.tsx`
```tsx
import { SignIn } from "@clerk/nextjs"
import { CenteredLayout } from "@/components/layouts"

export default function SignInPage() {
  return (
    <CenteredLayout>
      <SignIn
        appearance={{
          elements: {
            card: "bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl",
            headerTitle: "text-[var(--text-primary)] font-bold text-xl",
            headerSubtitle: "text-[var(--text-secondary)] text-sm",
            formButtonPrimary: "bg-primary hover:bg-primary-hover text-white font-semibold",
          },
        }}
      />
    </CenteredLayout>
  )
}
```

#### `app/auth/sign-up/[[...sign-up]]/page.tsx`
```tsx
import { SignUp } from "@clerk/nextjs"
import { CenteredLayout } from "@/components/layouts"

export default function SignUpPage() {
  return (
    <CenteredLayout>
      <SignUp
        appearance={{
          elements: {
            card: "bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl",
            headerTitle: "text-[var(--text-primary)] font-bold text-xl",
            headerSubtitle: "text-[var(--text-secondary)] text-sm",
            formButtonPrimary: "bg-primary hover:bg-primary-hover text-white font-semibold",
          },
        }}
      />
    </CenteredLayout>
  )
}
```

---

### 3.5 Admin Section Authorization: Top 2 Architectural Approaches

To enforce admin-only access for `/admin/*`, we evaluate the two best approaches:

#### **Approach 1: Clerk Public/Private Metadata & JWT Custom Claims (Recommended)**
- **How it works**: Assign `"role": "admin"` to admin user accounts via Clerk Dashboard or Clerk Admin SDK (`clerkClient.users.updateUserMetadata`). Include metadata in custom session claims (`sessionClaims.metadata.role`).
- **Middleware Check**: Next.js Middleware reads `sessionClaims.metadata.role` directly during the HTTP request. If `role !== "admin"`, access is denied immediately before any page or database logic executes.
- **Pros**:
  - Extremely fast (Zero database query latency on middleware execution).
  - Clean separation of auth metadata.
  - Native Clerk pattern for Next.js App Router.
- **Cons**:
  - Changing a user's role requires updating Clerk metadata.

> **Final Recommendation**: Combine **Approach 1** for instant edge-level Middleware route blocking with **Approach 2** for database auditability and ledger verification.

---

### 3.6 UI Shell & Profile Component Integration

#### Desktop Sidebar Integration
Update [components/shell/user-profile-region.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/components/shell/user-profile-region.tsx):
- Use `<SignedIn>` and `<SignedOut>` wrappers from `@clerk/nextjs`.
- Render `<UserButton showName userProfileMode="navigation" userProfileUrl="/profile" />` when signed in.

#### Mobile Profile Page & Bottom Navigation
Update [app/profile/page.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/app/profile/page.tsx):
- On mobile viewports, render Clerk's `<UserProfile routing="hash" />` inside the main page body or wrap inside a bottom sheet dialog triggered by the Profile tab in [components/shell/bottom-navigation.tsx](file:///c:/Users/THE%20LAPTOP%20STORE/Desktop/SHEYBI-V2/components/shell/bottom-navigation.tsx).

---

## 4. Dependencies

> [!IMPORTANT]
> **Dependency Correction Notice**: Standard Next.js App Router projects require installing `@clerk/nextjs` as a project dependency rather than installing a global package (`npm install -g clerk`).

### Required Packages
Run the following installation command in the project root:

```bash
npm install @clerk/nextjs @clerk/themes
```

- `@clerk/nextjs`: Clerk SDK for Next.js App Router (Middleware, Server Components, Hooks, UI components).
- `@clerk/themes`: Theme customization utilities (e.g. `dark` theme preset matching Sheybi aesthetics).

---

## 5. Verification Checklist

Use this checklist to verify complete implementation:

- [ ] **Sign In & Sign Out**:
  - Users can register using Email & Password via `/auth/sign-up`.
  - Users can sign in using Email & Password via `/auth/sign-in`.
  - Users can log out via the Clerk `<UserButton />` or `<UserProfile />` menu.
- [ ] **Route Protection**:
  - Unauthenticated users attempting to access `/portfolio`, `/wallet`, `/profile`, `/settings` are automatically redirected to `/auth/sign-in`.
  - Authenticated users can navigate seamlessly across all user pages.
- [ ] **Clerk Auth Components**:
  - Page `/auth/sign-in` renders Clerk's `<SignIn />` component cleanly.
  - Page `/auth/sign-up` renders Clerk's `<SignUp />` component cleanly.
- [ ] **Admin Section Guard**:
  - Non-admin users attempting to open `/admin` or `/admin/*` are blocked and redirected to `/`.
  - Users with `role: "admin"` (via Clerk Public Metadata / Database role) can access the Admin Dashboard.
- [ ] **Desktop Sidebar Profile Button**:
  - Desktop sidebar profile region displays Clerk's `<UserButton />` with username and avatar when signed in.
  - Displays "Log In" / "Sign Up" triggers when signed out.
- [ ] **Mobile Profile View / Bottom Sheet**:
  - Clicking the Profile tab on the mobile bottom navigation bar opens the `/profile` page rendering `<UserProfile />` cleanly.


  ## Critical rules

- Next.js 15+: `auth()` is async. Always `await auth()`
- `ClerkProvider` goes inside `<body>`, not wrapping `<html>`
- Next.js proxy matchers include `'/__clerk/:path*'` after
  `'/(api|trpc)(.*)'`
- Never expose `CLERK_SECRET_KEY` in client code
- Use `@clerk/nextjs`, not `@clerk/clerk-react`
- Do not read or print existing environment variable files; ask the user
  for any missing non-sensitive configuration

Docs: https://clerk.com/docs/cli https://clerk.com/docs/llms.txt

