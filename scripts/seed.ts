import { seedDatabase } from '../src/firebase/seed.js';
import { db } from '../src/firebase/config.js';
import { terminate } from '@firebase/firestore';

const seed = async () => {
  console.log('Starting to seed...');
  await seedDatabase();
  console.log('Seeding finished.');
  await terminate(db);
};

seed();
