import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MenuService } from './src/menu/menu.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connection = app.get<Connection>(getConnectionToken());

    console.log("🧹 Cleaning up invalid menu items...");

    const result = await connection.collection('menuitems').deleteMany({
        category: "Mains"
    });

    console.log(`✅ Deleted ${result.deletedCount} items with category 'Mains'.`);

    await app.close();
    process.exit(0);
}
bootstrap();
