import mongoose, { Schema, Types } from 'mongoose';

// Config
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

// Schemas (Simplified for migration)
const SectionSchema = new Schema(
  {
    name: String,
    restaurantId: Types.ObjectId,
  },
  { strict: false },
);

const CategorySchema = new Schema(
  {
    name: String,
    restaurantId: Types.ObjectId,
  },
  { strict: false },
);

const TableSchema = new Schema(
  {
    section: mongoose.Schema.Types.Mixed,
    restaurantId: Types.ObjectId,
  },
  { strict: false },
);

const MenuItemSchema = new Schema(
  {
    category: mongoose.Schema.Types.Mixed,
    restaurantId: Types.ObjectId,
  },
  { strict: false },
);

const SectionModel = mongoose.model('Section', SectionSchema);
const CategoryModel = mongoose.model('Category', CategorySchema);
const TableModel = mongoose.model('Table', TableSchema);
const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);

async function migrate() {
  console.log(`Connecting to ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // --- Migrate Tables ---
  console.log('Scanning tables...');
  const tables = await TableModel.find({}).exec();

  // Cache for sections: Map<RestaurantID, Map<SectionName, SectionID>>
  const sectionCache = new Map<string, Map<string, Types.ObjectId>>();

  for (const table of tables) {
    // Check if section is a string
    const currentSec = table.get('section');
    if (typeof currentSec === 'string') {
      const secName = currentSec || 'Main';
      const rId = table.get('restaurantId').toString();

      if (!sectionCache.has(rId)) sectionCache.set(rId, new Map());
      const rCache = sectionCache.get(rId)!;

      let secId = rCache.get(secName);

      if (!secId) {
        // Check if exists in DB
        let sectionDoc = await SectionModel.findOne({
          restaurantId: table.get('restaurantId'),
          name: secName,
        });
        if (!sectionDoc) {
          console.log(`Creating Section "${secName}" for Restaurant ${rId}`);
          sectionDoc = await SectionModel.create({
            name: secName,
            restaurantId: table.get('restaurantId'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        secId = sectionDoc._id;
        rCache.set(secName, secId);
      }

      console.log(`Updating Table ${table._id}: "${currentSec}" -> ${secId}`);
      table.set('section', secId);
      await table.save();
    }
  }

  // --- Migrate Menu Items ---
  console.log('Scanning menu items...');
  const items = await MenuItemModel.find({}).exec();
  const categoryCache = new Map<string, Map<string, Types.ObjectId>>();

  for (const item of items) {
    const currentCat = item.get('category');
    if (typeof currentCat === 'string') {
      const catName = currentCat || 'General';
      const rId = item.get('restaurantId').toString();

      if (!categoryCache.has(rId)) categoryCache.set(rId, new Map());
      const rCache = categoryCache.get(rId)!;

      let catId = rCache.get(catName);

      if (!catId) {
        let catDoc = await CategoryModel.findOne({
          restaurantId: item.get('restaurantId'),
          name: catName,
        });
        if (!catDoc) {
          console.log(`Creating Category "${catName}" for Restaurant ${rId}`);
          catDoc = await CategoryModel.create({
            name: catName,
            restaurantId: item.get('restaurantId'),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        catId = catDoc._id;
        rCache.set(catName, catId);
      }

      console.log(`Updating MenuItem ${item._id}: "${currentCat}" -> ${catId}`);
      item.set('category', catId);
      await item.save();
    }
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migrate().catch(console.error);
