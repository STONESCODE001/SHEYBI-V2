import { adminDb } from '../lib/instant-admin';

async function listAll() {
  try {
    const res = await adminDb.query({
      $users: {},
    });
    console.log('--- ALL USERS IN INSTANTDB ---');
    console.log(res.$users);
  } catch (err) {
    console.error('Error listing users:', err);
  }
}

listAll();
