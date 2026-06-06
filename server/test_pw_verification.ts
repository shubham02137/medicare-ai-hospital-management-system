import { getUserByEmail } from './src/data/store';
import { comparePassword } from './src/utils/helpers';

const usersToTest = [
  { email: 'admin@medicare.com', password: 'admin123' },
  { email: 'doctor@medicare.com', password: 'doctor123' },
  { email: 'nurse@medicare.com', password: 'nurse123' },
  { email: 'reception@medicare.com', password: 'reception123' },
  { email: 'patient@medicare.com', password: 'patient123' },
  { email: 'pharma@medicare.com', password: 'pharma123' },
  { email: 'lab@medicare.com', password: 'lab123' }
];

async function runTest() {
  console.log('Testing password verification for all seeded users...');
  for (const u of usersToTest) {
    const user = getUserByEmail(u.email);
    if (!user) {
      console.log(`[FAIL] User not found: ${u.email}`);
      continue;
    }
    const isMatch = await comparePassword(u.password, user.password_hash);
    if (isMatch) {
      console.log(`[PASS] ${u.email} password matched successfully.`);
    } else {
      console.log(`[FAIL] ${u.email} password did NOT match! Hash: ${user.password_hash}`);
    }
  }
}

runTest();
