/**
 * Promoter & Referral Administration Server Actions
 * ===================================================
 * Manages promoter entities, custom short links (/f/[slug]),
 * and referral tracking audit logs for Sheybi V2.
 *
 * @see context/feature-specs/21-promoter-referral-tracking.md
 */

'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { id } from '@instantdb/admin';
import { adminDb } from '@/lib/instant-admin';
import { revalidatePath } from 'next/cache';

// Helper: Ensure current user is an Admin
async function checkAdminAuth(): Promise<{ isAdmin: boolean; userId?: string }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { isAdmin: false };
  }

  let role = (sessionClaims?.metadata as { role?: string })?.role ||
             (sessionClaims?.publicMetadata as { role?: string })?.role ||
             (sessionClaims?.public_metadata as { role?: string })?.role;

  if (role !== 'admin') {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = (user.publicMetadata as { role?: string })?.role;
    } catch (err) {
      console.error('[Promoter Actions] Error checking Clerk user role:', err);
    }
  }

  return { isAdmin: role === 'admin', userId };
}

export interface CreatePromoterInput {
  name: string;
  slug?: string;
  notes?: string;
}

export interface CreatePromoterResult {
  success: boolean;
  promoterId?: string;
  slug?: string;
  error?: string;
}

/**
 * Creates a new promoter referral record and custom link slug (/f/[slug])
 */
export async function createPromoterAction(input: CreatePromoterInput): Promise<CreatePromoterResult> {
  try {
    const { isAdmin, userId } = await checkAdminAuth();
    if (!isAdmin || !userId) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    const name = input.name?.trim();
    if (!name) {
      return { success: false, error: 'Promoter name is required.' };
    }

    // Slug generation & normalization
    let rawSlug = input.slug?.trim() || name;
    const slug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      return { success: false, error: 'Invalid promoter slug format.' };
    }

    // Check slug uniqueness in InstantDB
    const existing = await adminDb.query({
      promoters: {
        $: {
          where: { slug },
        },
      },
    });

    if (existing?.promoters && existing.promoters.length > 0) {
      return { success: false, error: `Promoter slug "${slug}" is already taken. Please choose another.` };
    }

    const promoterId = id();
    const auditId = id();
    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.promoters[promoterId].update({
        name,
        slug,
        status: 'active',
        notes: input.notes?.trim() || undefined,
        totalSignups: 0,
        totalDepositedVolume: 0,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      }),
      adminDb.tx.audit_logs[auditId].update({
        adminUserId: userId,
        actionType: 'CREATE_PROMOTER',
        targetEntityId: promoterId,
        details: {
          name,
          slug,
          notes: input.notes,
        },
        createdAt: now,
      }),
    ]);

    revalidatePath('/admin');
    return { success: true, promoterId, slug };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create promoter';
    console.error('[Promoter Actions] createPromoterAction error:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Toggles promoter status between 'active' and 'paused'
 */
export async function togglePromoterStatusAction(
  promoterId: string,
  newStatus: 'active' | 'paused'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { isAdmin, userId } = await checkAdminAuth();
    if (!isAdmin || !userId) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    const auditId = id();
    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.promoters[promoterId].update({
        status: newStatus,
        updatedAt: now,
      }),
      adminDb.tx.audit_logs[auditId].update({
        adminUserId: userId,
        actionType: 'TOGGLE_PROMOTER_STATUS',
        targetEntityId: promoterId,
        details: { newStatus },
        createdAt: now,
      }),
    ]);

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to toggle promoter status';
    console.error('[Promoter Actions] togglePromoterStatusAction error:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Deletes a promoter record
 */
export async function deletePromoterAction(promoterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { isAdmin, userId } = await checkAdminAuth();
    if (!isAdmin || !userId) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    const auditId = id();
    const now = Date.now();

    await adminDb.transact([
      adminDb.tx.promoters[promoterId].delete(),
      adminDb.tx.audit_logs[auditId].update({
        adminUserId: userId,
        actionType: 'DELETE_PROMOTER',
        targetEntityId: promoterId,
        details: { deletedAt: now },
        createdAt: now,
      }),
    ]);

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete promoter';
    console.error('[Promoter Actions] deletePromoterAction error:', msg);
    return { success: false, error: msg };
  }
}
