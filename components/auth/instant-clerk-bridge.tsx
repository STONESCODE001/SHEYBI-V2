"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { db } from "@/lib/instant";
import { ensureUserWalletAction } from "@/lib/actions/wallet-provisioning";

const CLERK_CLIENT_NAME = process.env.NEXT_PUBLIC_INSTANT_CLERK_CLIENT_NAME || "clerk";

/**
 * InstantClerkBridge
 * ==================
 * Direct listener linking Clerk auth state with InstantDB session and profile sync.
 */
export function InstantClerkBridge() {
  const { isSignedIn, getToken } = useAuth();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    async function syncAuthAndProfile() {
      if (!isSignedIn) {
        try {
          await db.auth.signOut();
        } catch {
          // Already signed out
        }
        return;
      }

      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        const idToken = await getToken();
        if (!idToken) {
          isSyncingRef.current = false;
          return;
        }

        // 1. Sign in to InstantDB using Clerk session token
        await db.auth.signInWithIdToken({
          clientName: CLERK_CLIENT_NAME,
          idToken,
        });

        console.log("[InstantDB Auth] Signed in to InstantDB with Clerk token.");

        // 2. Sync profile attributes to $users entity & provision wallet
        const res = await ensureUserWalletAction();
        if (res.success) {
          console.log("[User & Wallet] Profile & Wallet synced successfully.");
        }
      } catch (err: any) {
        console.error("[InstantDB Auth] Auth sync notice:", err?.message || err);
      } finally {
        isSyncingRef.current = false;
      }
    }

    syncAuthAndProfile();
  }, [isSignedIn, getToken]);

  return null;
}
