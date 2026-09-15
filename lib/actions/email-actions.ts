/**
 * Email Server Actions (Loops.so Direct API Integration)
 * ========================================================
 * Handles transactional email broadcasts and marketing triggers via native fetch.
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/instant-admin';

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_MARKET_ALERT_ID = process.env.LOOPS_MARKET_ALERT_ID || 'cmu2qpdcw0axh0jz3cvyxb3ve';

/**
 * Broadcast New Market Alert email to registered users
 * @param marketTitle - Title of the live prediction market
 * @param marketId - Optional market ID for direct URL linking
 */
export async function broadcastMarketEmailAction(
  marketTitle: string,
  marketId?: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required.' };
    }

    if (!LOOPS_API_KEY) {
      return { success: false, error: 'LOOPS_API_KEY is missing in environment variables.' };
    }

    // Fetch all user contacts from InstantDB $users table
    const usersRes = await adminDb.query({
      $users: {},
    });

    const users = usersRes?.$users || [];
    const validEmails = users
      .map((u) => u.email)
      .filter((e): e is string => Boolean(e && e.includes('@')));

    if (validEmails.length === 0) {
      return { success: false, error: 'No user email contacts found in database.' };
    }

    const marketUrl = marketId
      ? `https://www.sheybi.app/markets?marketId=${marketId}`
      : 'https://www.sheybi.app/markets';

    let successCount = 0;

    // Send transactional email via native fetch to Loops API
    for (const email of validEmails) {
      try {
        const res = await fetch('https://app.loops.so/api/v1/transactional', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOOPS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionalId: LOOPS_MARKET_ALERT_ID,
            email,
            dataVariables: {
              marketTitle,
              marketUrl,
              firstName: email.split('@')[0],
            },
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn(`[Loops Email API] Error sending to ${email}:`, errData);
        }
      } catch (err) {
        console.warn(`[Loops Email API] Exception sending market alert to ${email}:`, err);
      }
    }

    console.log(`[Loops Email API] Successfully broadcasted market alert "${marketTitle}" to ${successCount} users.`);

    return {
      success: true,
      count: successCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to broadcast email.';
    console.error('[Loops Email API] Error broadcasting market email:', message);
    return { success: false, error: message };
  }
}
