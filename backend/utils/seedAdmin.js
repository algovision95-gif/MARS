import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'bishnu@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'bishnu@123';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('✅ Admin user already exists');
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      email,
      password: hashed,
      role: 'ADMIN',
      subscriptionType: 'PREMIUM',
    });

    console.log(`✅ Admin seeded: ${email} / ${password}`);
  } catch (err) {
    console.error('⚠️  Admin seed failed:', err.message);
  }
}
