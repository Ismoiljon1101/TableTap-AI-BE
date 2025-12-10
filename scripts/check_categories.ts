
import mongoose from 'mongoose';
import { config } from '../src/config/configuration';

async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/tabletap');
    console.log('Connected to DB');

    const cats = await mongoose.connection.db?.collection('categories').find({}).toArray();
    console.log('Categories found:', cats?.length);
    console.log(JSON.stringify(cats, null, 2));

    await mongoose.disconnect();
}

check();
