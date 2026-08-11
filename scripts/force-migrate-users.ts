import { adminDb } from '../lib/instant-admin';

async function forceMigrate() {
  try {
    const res = await adminDb.query({
      $users: {},
    });

    const users = res?.$users || [];
    console.log('Found users count:', users.length);

    const updates: { email: string; clerkUserId: string }[] = [];

    for (const user of users) {
      if (user.avatarUrl) {
        // Decode base64 substring in avatarUrl if present
        try {
          const parts = user.avatarUrl.split('/');
          const base64Part = parts[parts.length - 1];
          const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
          const match = decoded.match(/user_[A-Za-z0-9]+/);
          if (match) {
            console.log(`Decoded ${user.email} -> ${match[0]}`);
            updates.push({ email: user.email, clerkUserId: match[0] });
            await adminDb.transact([
              adminDb.tx.$users[user.id].update({
                clerkUserId: match[0],
              }),
            ]);
          }
        } catch (e) {
          console.error(`Failed to decode for ${user.email}:`, e);
        }
      }
    }

    console.log('Force migration finished successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

forceMigrate();
