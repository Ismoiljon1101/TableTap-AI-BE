/**
 * seed_floor.ts
 * Seeds realistic table and section data for a restaurant.
 *
 * Usage: pnpm exec ts-node -r tsconfig-paths/register src/scripts/seed_floor.ts <restaurantId>
 *
 * This script:
 * 1. Creates 3 sections (Main Hall, Terrace, VIP Lounge).
 * 2. Creates 12 tables distributed across those sections.
 * 3. All tables use the new grid-unit sizing (width/height in grid units)
 *    and true coordinate system (x/y with center origin).
 * 4. Each table has a unique `code` for quick identification.
 */

import mongoose, { Schema, Types } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

// ─── Simplified schemas (strict:false to avoid full NestJS import) ───────────
const SectionSchema = new Schema({ name: String, restaurantId: Types.ObjectId, code: String }, { strict: false });
const TableSchema = new Schema({ restaurantId: Types.ObjectId }, { strict: false });

const SectionModel = mongoose.model('Section', SectionSchema);
const TableModel = mongoose.model('Table', TableSchema);

// ─── Seed data that matches the schema exactly ───────────────────────────────
interface SeedSection {
    name: string;
    code: string;
}

interface SeedTable {
    name: string;
    displayName: string;
    code: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    /** Grid coordinate X — origin (0,0) is canvas center */
    positionX: number;
    /** Grid coordinate Y — positive = up, negative = down */
    positionY: number;
    /** Width in grid units (1=small square, 2=standard rectangle, 3=long) */
    width: number;
    /** Height in grid units */
    height: number;
    shape: 'rectangle' | 'circle';
    rotation: number;
    sectionCode: string;
}

const SECTIONS: SeedSection[] = [
    { name: 'Main Hall', code: 'MH' },
    { name: 'Terrace', code: 'TR' },
    { name: 'VIP Lounge', code: 'VIP' },
];

/** Tables arranged using the grid coordinate system.
 *  Origin (0,0) is the center of the floor canvas.
 *  X is positive to the right, Y is positive upward.
 */
const TABLES: SeedTable[] = [
    // Main Hall — left quadrant
    { name: 'MH-1', displayName: 'Table 1', code: 'T1', capacity: 4, status: 'available', positionX: -9, positionY: 3,  width: 2, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'MH' },
    { name: 'MH-2', displayName: 'Table 2', code: 'T2', capacity: 4, status: 'occupied',  positionX: -6, positionY: 3,  width: 2, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'MH' },
    { name: 'MH-3', displayName: 'Table 3', code: 'T3', capacity: 6, status: 'available', positionX: -9, positionY: 0,  width: 3, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'MH' },
    { name: 'MH-4', displayName: 'Table 4', code: 'T4', capacity: 2, status: 'reserved',  positionX: -5, positionY: 0,  width: 1, height: 1, shape: 'circle',    rotation: 0, sectionCode: 'MH' },
    { name: 'MH-5', displayName: 'Table 5', code: 'T5', capacity: 4, status: 'available', positionX: -9, positionY: -3, width: 2, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'MH' },
    { name: 'MH-6', displayName: 'Table 6', code: 'T6', capacity: 4, status: 'occupied',  positionX: -6, positionY: -3, width: 2, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'MH' },

    // Terrace — right quadrant
    { name: 'TR-1', displayName: 'Terrace 1', code: 'R1', capacity: 4, status: 'available', positionX: 3, positionY: 3,  width: 2, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'TR' },
    { name: 'TR-2', displayName: 'Terrace 2', code: 'R2', capacity: 4, status: 'available', positionX: 6, positionY: 3,  width: 2, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'TR' },
    { name: 'TR-3', displayName: 'Terrace 3', code: 'R3', capacity: 2, status: 'available', positionX: 3, positionY: 0,  width: 1, height: 1, shape: 'circle',    rotation: 0, sectionCode: 'TR' },
    { name: 'TR-4', displayName: 'Terrace 4', code: 'R4', capacity: 2, status: 'occupied',  positionX: 5, positionY: 0,  width: 1, height: 1, shape: 'circle',    rotation: 0, sectionCode: 'TR' },

    // VIP Lounge — upper area
    { name: 'VIP-1', displayName: 'VIP 1', code: 'V1', capacity: 8, status: 'available', positionX: -2, positionY: 6, width: 4, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'VIP' },
    { name: 'VIP-2', displayName: 'VIP 2', code: 'V2', capacity: 6, status: 'reserved',  positionX:  2, positionY: 6, width: 3, height: 1, shape: 'rectangle', rotation: 0, sectionCode: 'VIP' },
];

async function seed() {
    console.log(`🔗  Connecting to ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected.\n');

    const RestaurantModel = mongoose.model('Restaurant', new Schema({}, { strict: false }));
    const UserModel = mongoose.model('User', new Schema({}, { strict: false }));

    // 1. Get all unique restaurantIds from users
    const users = await UserModel.find({}).lean() as any[];
    const uniqueRestaurantIds = Array.from(new Set(users.map(u => u.restaurantId?.toString()).filter(id => !!id)));

    console.log(`👤  Found ${users.length} users across ${uniqueRestaurantIds.length} unique restaurant IDs.\n`);

    for (const ridStr of uniqueRestaurantIds) {
        const rid = new Types.ObjectId(ridStr);
        
        // 2. Ensure restaurant exists
        let restaurant = await RestaurantModel.findById(rid);
        if (!restaurant) {
            console.log(`🏢  Restaurant ${rid} missing! Creating stub...`);
            restaurant = await RestaurantModel.create({
                _id: rid,
                name: `Seeded Restaurant ${ridStr.slice(-4)}`,
                settings: { currency: 'USD', taxRate: 0, timezone: 'UTC', autoPrint: false },
                subscription: { plan: 'pro', status: 'active' },
            });
        }

        const now = new Date();
        console.log(`───────────────────────────────────────────────────`);
        console.log(`👉  Syncing Floor for: "${restaurant.get('name')}" (${rid})`);

        // ── 3. Create sections ──────────────────────────────────────────────
        const sectionIdMap = new Map<string, Types.ObjectId>();
        for (const s of SECTIONS) {
            let doc = await SectionModel.findOne({ restaurantId: rid, name: s.name });
            if (!doc) {
                doc = await SectionModel.create({
                    name: s.name,
                    code: s.code,
                    restaurantId: rid,
                    createdAt: now,
                    updatedAt: now,
                });
                console.log(`    ➕ Created section "${s.name}"`);
            }
            sectionIdMap.set(s.code, doc._id as Types.ObjectId);
        }

        // ── 4. Create tables ──────────────────────────────────────────────
        for (const t of TABLES) {
            const sectionId = sectionIdMap.get(t.sectionCode);
            const existing = await TableModel.findOne({ restaurantId: rid, name: t.name });
            if (existing) continue;

            await TableModel.create({
                name: t.name,
                displayName: t.displayName,
                code: t.code,
                capacity: t.capacity,
                status: t.status,
                position: { x: t.positionX, y: t.positionY },
                width: t.width,
                height: t.height,
                shape: t.shape,
                rotation: t.rotation,
                section: sectionId,
                restaurantId: rid,
                createdAt: now,
                updatedAt: now,
            });
            console.log(`    ➕ Created table "${t.displayName}" [${t.code}]`);
        }
    }

    console.log(`\n───────────────────────────────────────────────────`);
    console.log('🎉  Global Sync complete!');
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
});
