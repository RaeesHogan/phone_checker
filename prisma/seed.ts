import { PrismaClient, Role, Status } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Admin User
  const adminPasswordHash = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      active: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.username}`);

  // 2. Create Staff User
  const staffPasswordHash = await argon2.hash('staff123');
  const staff = await prisma.user.upsert({
    where: { username: 'staff01' },
    update: {},
    create: {
      username: 'staff01',
      passwordHash: staffPasswordHash,
      fullName: 'Staff Member 01',
      role: Role.USER,
      active: true,
    },
  });
  console.log(`✅ Staff user created: ${staff.username}`);

  // 3. Initial Settings
  const settings = [
    { key: 'RESERVATION_EXPIRE_DAYS', value: '14' },
    { key: 'SESSION_TIMEOUT_HOURS', value: '8' },
    { key: 'EXPORT_MAX_ROWS', value: '10000' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Default settings initialized');

  console.log('🌿 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
