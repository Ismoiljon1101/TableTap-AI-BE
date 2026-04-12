import mongoose, { Schema } from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

async function diagnose() {
  await mongoose.connect(MONGODB_URI);

  const UserModel = mongoose.model('User', new Schema({}, { strict: false }));
  const RestaurantModel = mongoose.model(
    'Restaurant',
    new Schema({}, { strict: false }),
  );
  const TableModel = mongoose.model('Table', new Schema({}, { strict: false }));

  const targetEmails = ['career@ismaildev.uz', 'damir@damir.com'];

  console.log(`\n🔍  Targeted User Diagnosis:`);
  for (const email of targetEmails) {
    const user: any = await UserModel.findOne({ email }).exec();
    if (user) {
      const rid = user.restaurantId;
      const restaurant: any = await RestaurantModel.findById(rid);
      const tablesCount = await TableModel.countDocuments({
        restaurantId: rid,
      });

      console.log(`---------------------------------------------------`);
      console.log(`👤  User: ${email}`);
      console.log(`🏠  Assigned RID: ${rid}`);
      console.log(
        `🏢  Restaurant Found: ${restaurant ? restaurant.name : '❌ NOT IN DB'}`,
      );
      console.log(`🪑  Tables Found: ${tablesCount}`);
    } else {
      console.log(`👤  User: ${email} -> ❌ NOT FOUND`);
    }
  }

  await mongoose.disconnect();
}

diagnose().catch(console.error);
