"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { db } from "@/lib/instant";
import { ensureUserWalletAction } from "@/lib/actions/wallet-provisioning";
import { claimUserPromoBonusAction } from "@/lib/actions/wallet-actions";
import { toast } from "sonner";
import { Gift } from "lucide-react";

const CLERK_CLIENT_NAME = process.env.NEXT_PUBLIC_INSTANT_CLERK_CLIENT_NAME || "clerk";

/**
 * InstantClerkBridge
 * ==================
 * Direct listener linking Clerk auth state with InstantDB session, profile sync,
 * and automatic email link promo bonus redemption.
 */
export function InstantClerkBridge() {
  const { isSignedIn, getToken } = useAuth();
  const isSyncingRef = useRef(false);
  const isPromoClaimedRef = useRef(false);

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

        // 3. Check for email link bonus claim trigger (utm_source=loops or claim_bonus=true)
        if (typeof window !== "undefined" && !isPromoClaimedRef.current) {
          const urlParams = new URLSearchParams(window.location.search);
          const hasBonusTrigger =
            urlParams.get("claim_bonus") === "true" ||
            urlParams.get("utm_source") === "loops" ||
            urlParams.has("utm_campaign");

          if (hasBonusTrigger) {
            isPromoClaimedRef.current = true;
            const claimRes = await claimUserPromoBonusAction();

            if (claimRes.success) {
              toast.success("₦300 Bonus Claimed! Playable funds added to your wallet.", {
                description: "You can start predicting on Big Brother Naija markets right away.",
                icon: <Gift className="h-4 w-4 text-[#FFC91F]" />,
              });
            } else if (claimRes.alreadyClaimed) {
              toast.info("Your ₦300 bonus is already active in your wallet!", {
                icon: <Gift className="h-4 w-4 text-[#FFC91F]" />,
              });
            }

            // Cleanly remove bonus query params from URL without page reload
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("claim_bonus");
            cleanUrl.searchParams.delete("utm_source");
            cleanUrl.searchParams.delete("utm_medium");
            cleanUrl.searchParams.delete("utm_campaign");
            window.history.replaceState({}, "", cleanUrl.toString());
          }
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
