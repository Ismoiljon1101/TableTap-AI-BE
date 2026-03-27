import mongoose, { Schema } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

async function checkSections() {
    await mongoose.connect(MONGODB_URI);
    
    const rid = '69c27ab9735ee6e314db7e21';
    const SectionModel = mongoose.model('Section', new Schema({}, { strict: false }));
    const TableModel = mongoose.model('Table', new Schema({}, { strict: false }));

    const sections = await SectionModel.find({ restaurantId: rid }).lean();
    const tables = await TableModel.find({ restaurantId: rid }).lean();

    console.log(`\n🕵️  Deep Dive for RID: ${rid}`);
    console.log(`---------------------------------------------------`);
    console.log(`🗂️  Sections found: ${sections.length}`);
    sections.forEach((s: any) => console.log(`  - ${s.name} [ID: ${s._id}] (RID: ${s.restaurantId})`));
    
    console.log(`\n🪑  Tables found: ${tables.length}`);
    if (tables.length > 0) {
        console.log(`  - First Table Section Link: ${(tables[0] as any).section}`);
    }
    
    await mongoose.disconnect();
}

checkSections().catch(console.error);
