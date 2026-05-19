/**
 * SEED SCRIPT
 *
 * Populates the database with realistic demo data.
 * Run once after migrations: npm run seed
 *
 * What gets created:
 *   - 1 admin user   (admin@store.com / admin123)
 *   - 1 customer user (customer@store.com / customer123)
 *   - 6 devices (iPhone, Samsung, Google, OnePlus, Sony, Xiaomi)
 *   - 54 variants (6 devices × 3 colors × 3 storage tiers)
 *
 * Why 54 variants?
 *   Enough rows to make the N+1 query demo meaningful.
 *   With 6 devices + lazy loading: 1 (devices) + 6 (variants each) = 7 DB queries.
 *   With eager loading (JOIN): 1 query total.
 *   The difference is visible in response time and query logs.
 */

import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/user.entity';
import { Device } from '../entities/device.entity';
import { DeviceVariant } from '../entities/device-variant.entity';
import * as bcrypt from 'bcrypt';

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const devices = [
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    description:
      'Titanium design, A17 Pro chip, and a pro camera system with 5x optical zoom.',
    basePrice: 999,
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium',
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium'],
    storages: [
      { gb: 128, priceDelta: 0 },
      { gb: 256, priceDelta: 100 },
      { gb: 512, priceDelta: 300 },
    ],
  },
  {
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    description:
      'The ultimate Galaxy experience with built-in S Pen and 200MP camera.',
    basePrice: 1299,
    imageUrl: 'https://images.samsung.com/us/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-color-titaniumblack.jpg',
    colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet'],
    storages: [
      { gb: 256, priceDelta: 0 },
      { gb: 512, priceDelta: 120 },
      { gb: 1024, priceDelta: 300 },
    ],
  },
  {
    name: 'Pixel 8 Pro',
    brand: 'Google',
    description:
      'Google AI built in. The most helpful Pixel yet with Google Tensor G3 chip.',
    basePrice: 999,
    imageUrl: 'https://lh3.googleusercontent.com/nu4aZJFXQRHMKpWfZFyWVZmPAFfHXOl5J3FuNqMBr0hy4TgkMidOPIvRNGDWgVaEEAr6kHa-3kQSSQ',
    colors: ['Obsidian', 'Porcelain', 'Bay'],
    storages: [
      { gb: 128, priceDelta: 0 },
      { gb: 256, priceDelta: 100 },
      { gb: 512, priceDelta: 200 },
    ],
  },
  {
    name: 'OnePlus 12',
    brand: 'OnePlus',
    description:
      'Snapdragon 8 Gen 3 with 100W SUPERVOOC fast charging. 0 to 100% in 26 minutes.',
    basePrice: 799,
    imageUrl: 'https://image01.oneplus.net/ebp/202312/26/1-m00-4a-69-rb8bwwwjftyad39maabytk7lq3o791.png',
    colors: ['Silky Black', 'Flowy Emerald', 'Glacial White'],
    storages: [
      { gb: 256, priceDelta: 0 },
      { gb: 512, priceDelta: 100 },
      { gb: 1024, priceDelta: 200 },
    ],
  },
  {
    name: 'Xperia 1 VI',
    brand: 'Sony',
    description:
      'Entertainment flagship with 4K OLED display and professional-grade camera controls.',
    basePrice: 1299,
    imageUrl: 'https://www.sony.com/image/5d02da5df552836db894cead8a68f5f3',
    colors: ['Platinum Silver', 'Black', 'Khaki Green'],
    storages: [
      { gb: 256, priceDelta: 0 },
      { gb: 512, priceDelta: 150 },
      { gb: 1024, priceDelta: 350 },
    ],
  },
  {
    name: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    description:
      'Co-engineered with Leica. Quad-lens camera system with 1-inch main sensor.',
    basePrice: 1099,
    imageUrl: 'https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0/pms_1708491664.08424543.png',
    colors: ['Titanium Gray', 'White', 'Black'],
    storages: [
      { gb: 256, priceDelta: 0 },
      { gb: 512, priceDelta: 100 },
      { gb: 1024, priceDelta: 250 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  // Initialize the database connection
  await AppDataSource.initialize();
  console.log('📦 Database connected. Starting seed...\n');

  const userRepo = AppDataSource.getRepository(User);
  const deviceRepo = AppDataSource.getRepository(Device);
  const variantRepo = AppDataSource.getRepository(DeviceVariant);

  // -------------------------------------------------------------------------
  // Seed users
  // -------------------------------------------------------------------------

  // bcrypt.hash(password, saltRounds) — saltRounds=10 is the standard balance
  // Higher rounds = more secure but slower to hash (10 rounds ≈ 100ms)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // upsert — insert if not exists, skip if email already seeded
  // Lets you run the seed script multiple times without duplicating data
  await userRepo.upsert(
    [
      {
        email: 'admin@store.com',
        password: adminPassword,
        role: UserRole.ADMIN,
      },
      {
        email: 'customer@store.com',
        password: customerPassword,
        role: UserRole.CUSTOMER,
      },
    ],
    { conflictPaths: ['email'], skipUpdateIfNoValuesChanged: true },
  );

  console.log('✅ Users seeded: admin@store.com / customer@store.com\n');

  // -------------------------------------------------------------------------
  // Seed devices + variants
  // -------------------------------------------------------------------------

  for (const deviceData of devices) {
    // Check if already seeded (idempotent — safe to run multiple times)
    const existing = await deviceRepo.findOne({
      where: { name: deviceData.name },
    });

    if (existing) {
      console.log(`⏭️  Skipping ${deviceData.name} (already exists)`);
      continue;
    }

    // Create the device row
    const device = deviceRepo.create({
      name: deviceData.name,
      brand: deviceData.brand,
      description: deviceData.description,
      basePrice: deviceData.basePrice,
      imageUrl: deviceData.imageUrl,
    });
    await deviceRepo.save(device);

    // Create 9 variants (3 colors × 3 storage options)
    // Array.flat() flattens [[v1,v2,v3],[v4,v5,v6],...] into [v1,v2,...,v9]
    const variants = deviceData.colors.flatMap((color) =>
      deviceData.storages.map((storage) =>
        variantRepo.create({
          device,                          // TypeORM automatically sets device_id FK
          color,
          storageGb: storage.gb,
          priceDelta: storage.priceDelta,
          stockCount: 50,                  // 50 units per variant in stock
        }),
      ),
    );

    // Insert all 9 variants in one batch — more efficient than 9 separate INSERTs
    await variantRepo.save(variants);

    console.log(`✅ Seeded: ${deviceData.name} (${variants.length} variants)`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('   Login credentials:');
  console.log('   Admin:    admin@store.com    / admin123');
  console.log('   Customer: customer@store.com / customer123\n');

  await AppDataSource.destroy();
}

// Run the seed and handle errors
seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
