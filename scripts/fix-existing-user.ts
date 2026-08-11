import { adminDb } from '../lib/instant-admin';

async function fixExistingUser() {
  try {
    const res = await adminDb.query({
      $users: {
        $: {
          where: { email: 'sheybiapp@gmail.com' },
        },
      },
    });

    const user = res?.$users?.[0];
    if (user) {
      console.log('Found user:', user);
      await adminDb.transact([
        adminDb.tx.$users[user.id].update({
          clerkUserId: 'user_3HjvuQLrjw3HXveOtuJ98z8N3nB',
          role: 'admin',
          displayName: 'Sheybi Admin',
        }),
      ]);
      console.log('Successfully updated clerkUserId and role for sheybiapp@gmail.com!');
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error updating user:', err);
  }
}

fixExistingUser();
