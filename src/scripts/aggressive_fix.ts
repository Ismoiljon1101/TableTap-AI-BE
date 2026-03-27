import mongoose, { Schema, Types } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

async function aggressiveFix() {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗  Aggressive Fix Started...');

    const RestaurantModel = mongoose.model('Restaurant', new Schema({}, { strict: false }));
    const TableModel = mongoose.model('Table', new Schema({}, { strict: false }));
    const SectionModel = mongoose.model('Section', new Schema({}, { strict: false }));
    const UserModel = mongoose.model('User', new Schema({}, { strict: false }));

    const r = await RestaurantModel.findOne({ name: 'eid' });
    if (!r) {
        console.error('❌ Could not find "eid" restaurant.');
        return;
    }
    const rid = r._id;

    // 1. Force all users to this rid
    const uResult = await UserModel.updateMany({}, { $set: { restaurantId: rid } });
    console.log(`👤  Updated ${uResult.modifiedCount} users to RID: ${rid}`);

    // 2. Ensure RID has tables
    const tCount = await TableModel.countDocuments({ restaurantId: rid });
    console.log(`🪑  Restaurant ${rid} currently has ${tCount} tables.`);

    if (tCount === 0) {
        console.log('⚠️  Tables missing! You should run seed_floor.ts next.');
    }

    await mongoose.disconnect();
}

aggressiveFix().catch(console.error);
