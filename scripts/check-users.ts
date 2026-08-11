import { adminDb } from '../lib/instant-admin';

async function checkUsers() {
  try {
    const res = await adminDb.query({
      $users: {},
      wallets: {},
    });
    console.log('--- INSTANTDB USERS ---');
    console.log(JSON.stringify(res.$users, null, 2));
    console.log('--- INSTANTDB WALLETS ---');
    console.log(JSON.stringify(res.wallets, null, 2));
  } catch (err) {
    console.error('Error querying users:', err);
  }
}

checkUsers();
