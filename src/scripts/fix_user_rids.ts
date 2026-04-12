import mongoose, { Schema, Types } from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tabletap';

async function fix() {
  await mongoose.connect(MONGODB_URI);

  const RestaurantModel = mongoose.model(
    'Restaurant',
    new Schema({}, { strict: false }),
  );
  const UserModel = mongoose.model('User', new Schema({}, { strict: false }));

  const validRestaurant = await RestaurantModel.findOne({});
  if (!validRestaurant) {
    console.error('No valid restaurants found to link users to!');
    return;
  }

  const users = await UserModel.find({});
  console.log(`🔧  Fixing ${users.length} users...`);

  for (const user of users) {
    const rid = user.get('restaurantId');
    if (!rid || !Types.ObjectId.isValid(rid.toString())) {
      console.log(
        `  ❌ User ${user.get('email')} had invalid RID: ${rid}. Fixing to ${validRestaurant._id}`,
      );
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { restaurantId: validRestaurant._id } },
      );
    } else {
      // Check if it exists
      const exists = await RestaurantModel.findById(rid);
      if (!exists) {
        console.log(
          `  ❌ User ${user.get('email')} had non-existent RID: ${rid}. Linking to ${validRestaurant._id}`,
        );
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { restaurantId: validRestaurant._id } },
        );
      }
    }
  }

  console.log('✅  User records normalized.');
  await mongoose.disconnect();
}

fix().catch(console.error);
