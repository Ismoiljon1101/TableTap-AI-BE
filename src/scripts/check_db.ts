import mongoose, { Schema } from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

async function diagnose() {
  console.log(`🔗  Connecting to ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);

  // Use any to avoid TS errors for quick diagnosis
  const RestaurantModel = mongoose.model(
    'Restaurant',
    new Schema({}, { strict: false }),
  );
  const TableModel = mongoose.model('Table', new Schema({}, { strict: false }));
  const SectionModel = mongoose.model(
    'Section',
    new Schema({}, { strict: false }),
  );
  const UserModel = mongoose.model('User', new Schema({}, { strict: false }));

  const restaurants: any[] = await RestaurantModel.find({}).exec();
  const tablesCount = await TableModel.countDocuments({});
  const users: any[] = await UserModel.find({}).exec();

  console.log(`\n📊  SYSTEM STATUS:`);
  console.log(`---------------------------------------------------`);
  console.log(`🏢  Total Restaurants: ${restaurants.length}`);
  console.log(`🪑  Total Tables:      ${tablesCount}`);
  console.log(`👤  Total Users:       ${users.length}`);
  console.log(`---------------------------------------------------\n`);

  console.log(`🏢  RESTAURANTS LIST:`);
  for (const r of restaurants) {
    const tCount = await TableModel.countDocuments({ restaurantId: r._id });
    const sCount = await SectionModel.countDocuments({ restaurantId: r._id });
    console.log(
      `- "${r.name || 'N/A'}" [ID: ${r._id}] -> ${tCount} tables, ${sCount} sections`,
    );
  }

  console.log(`\n👤  USERS LIST:`);
  for (const u of users) {
    console.log(
      `- "${u.nickname}" [${u.email}] -> RestaurantID: ${u.restaurantId || 'NONE'} (Role: ${u.role})`,
    );
  }

  await mongoose.disconnect();
}

diagnose().catch(console.error);
