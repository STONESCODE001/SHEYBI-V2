import { adminDb } from '../lib/instant-admin';

async function migrateAllUsers() {
  try {
    const res = await adminDb.query({
      $users: {},
      wallets: {},
    });

    const users = res?.$users || [];
    const wallets = res?.wallets || [];

    console.log(`Found ${users.length} users and ${wallets.length} wallets.`);

    const txs: any[] = [];

    for (const user of users) {
      // Try to match clerkUserId from avatarUrl rid param
      let clerkUserId: string | null = null;
      if (user.avatarUrl) {
        const match = user.avatarUrl.match(/user_[A-Za-z0-9]+/);
        if (match) {
          clerkUserId = match[0];
        }
      }

      if (clerkUserId) {
        console.log(`Mapping user ${user.email} (${user.id}) -> clerkUserId: ${clerkUserId}`);
        txs.push(
          adminDb.tx.$users[user.id].update({
            clerkUserId,
          })
        );
      }
    }

    if (txs.length > 0) {
      await adminDb.transact(txs);
      console.log(`Successfully migrated ${txs.length} users in InstantDB Cloud!`);
    } else {
      console.log('No user records needed migration.');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrateAllUsers();
