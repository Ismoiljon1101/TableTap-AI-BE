import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderCounter, OrderCounterSchema } from './schemas/order-counter.schema';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { TablesModule } from '../tables/tables.module';
import { PrinterModule } from '../printer/printer.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: OrderCounter.name, schema: OrderCounterSchema },
        ]),
        TablesModule,
        PrinterModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersGateway],
    exports: [OrdersService, OrdersGateway],
})
export class OrdersModule { }
