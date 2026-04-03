const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'tabletap';

async function sweep() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        console.log(`🚀 Starting Global ID Sweep in database: ${dbName}`);

        // 1. Fix restaurantId (String -> ObjectId) in ALL relevant collections
        const ridCollections = ['sections', 'tables', 'categories', 'menuitems', 'users', 'orders'];
        for (const colName of ridCollections) {
            const col = db.collection(colName);
            const docs = await col.find({ restaurantId: { $type: 'string' } }).toArray();
            console.log(`🔍 [${colName}] Found ${docs.length} docs with string restaurantId`);
            for (const doc of docs) {
                if (ObjectId.isValid(doc.restaurantId)) {
                    await col.updateOne({ _id: doc._id }, { $set: { restaurantId: new ObjectId(doc.restaurantId) } });
                }
            }
        }

        // 2. Fix 'section' (String -> ObjectId) in 'tables'
        const tablesCol = db.collection('tables');
        const sectionDocs = await tablesCol.find({ section: { $type: 'string' } }).toArray();
        console.log(`🔍 [tables] Found ${sectionDocs.length} docs with string sectionId`);
        for (const doc of sectionDocs) {
            if (ObjectId.isValid(doc.section)) {
                await tablesCol.updateOne({ _id: doc._id }, { $set: { section: new ObjectId(doc.section) } });
            }
        }

        // 3. Fix 'category' (String -> ObjectId) in 'menuitems'
        const menuCol = db.collection('menuitems');
        const categoryDocs = await menuCol.find({ category: { $type: 'string' } }).toArray();
        console.log(`🔍 [menuitems] Found ${categoryDocs.length} docs with string categoryId`);
        for (const doc of categoryDocs) {
            if (ObjectId.isValid(doc.category)) {
                await menuCol.updateOne({ _id: doc._id }, { $set: { category: new ObjectId(doc.category) } });
            }
        }

        console.log('✨ Global ID Sweep Complete!');
    } catch (err) {
        console.error('❌ Sweep failed:', err);
    } finally {
        await client.close();
    }
}

sweep();
