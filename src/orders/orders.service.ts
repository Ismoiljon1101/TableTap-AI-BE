import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { OrderCounter, OrderCounterDocument } from './schemas/order-counter.schema';
import { CreateOrderDto } from './dto/order.dto';
import { PrinterService } from '../printer/printer.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderCounter.name) private orderCounterModel: Model<OrderCounterDocument>,
        private printerService: PrinterService,
    ) { }

    async create(
        restaurantId: string | Types.ObjectId,
        waiterId: string | Types.ObjectId,
        createOrderDto: CreateOrderDto,
    ): Promise<OrderDocument> {
        try {
            const { tableId, items } = createOrderDto;

            // Validate items
            if (!items || items.length === 0) {
                throw new Error('Order must contain at least one item');
            }

            console.log('📊 Processing order with items:', items.length);

            // Get next order number
            const orderNumber = await this.getNextOrderNumber(restaurantId);
            console.log('🔢 Order number generated:', orderNumber);

            // Calculate totals
            const subtotal = items.reduce((sum, item) => {
                const modifiersTotal = item.modifiers?.reduce((modSum, mod) => modSum + mod.price, 0) || 0;
                return sum + (item.unitPrice + modifiersTotal) * item.quantity;
            }, 0);

            // Calculate tax (assuming it's stored in restaurant settings, for now use 0)
            const tax = 0;
            const total = subtotal + tax;

            console.log('💰 Calculated totals - Subtotal:', subtotal, 'Tax:', tax, 'Total:', total);

            const order = new this.orderModel({
                orderNumber,
                restaurantId,
                tableId,
                waiterId,
                items,
                subtotal,
                tax,
                total,
                status: OrderStatus.PENDING,
            });


            console.log('💾 Saving order to database...');
            const savedOrder = await order.save();
            console.log('✅ Order saved with ID:', savedOrder._id);

            // Populate fields for printer
            const populatedOrder = await savedOrder.populate([
                { path: 'tableId', select: 'name displayName' },
                { path: 'waiterId', select: 'nickname' }
            ]);

            // ---- SERVER SIDE PRINTING (Simulation) ----
            // We print AFTER saving to DB. If printing fails, order is still saved.
            // In production, you might want to log print errors to an alert system.
            this.printerService.printOrder(populatedOrder).catch(err => {
                console.error('⚠️ Printing failed:', err);
            });

            return savedOrder;
        } catch (error: any) {
            console.error('❌ Error in OrdersService.create:', error);
            console.error('Error stack:', error.stack);
            console.error('DTO received:', JSON.stringify(createOrderDto, null, 2));
            throw error;
        }
    }

    async findAll(
        restaurantId: string | Types.ObjectId,
        status?: OrderStatus,
        tableId?: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<OrderDocument[]> {
        const filter: any = { restaurantId };

        if (status) {
            filter.status = status;
        }

        if (tableId) {
            filter.tableId = tableId;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        return this.orderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .populate('tableId')
            .populate('waiterId', 'nickname email')
            .exec();
    }

    async findById(id: string | Types.ObjectId): Promise<OrderDocument | null> {
        return this.orderModel
            .findById(id)
            .populate('tableId')
            .populate('waiterId', 'nickname email')
            .exec();
    }

    async updateStatus(id: string | Types.ObjectId, status: OrderStatus): Promise<OrderDocument | null> {
        const updateData: any = { status };

        if (status === OrderStatus.SERVED) {
            updateData.servedAt = new Date();
        }

        return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async addItems(id: string | Types.ObjectId, newItems: any[]): Promise<OrderDocument | null> {
        const order = await this.orderModel.findById(id);
        if (!order) return null;

        order.items.push(...newItems);

        // Recalculate totals
        const subtotal = order.items.reduce((sum, item) => {
            const modifiersTotal = item.modifiers?.reduce((modSum, mod) => modSum + mod.price, 0) || 0;
            return sum + (item.unitPrice + modifiersTotal) * item.quantity;
        }, 0);

        order.subtotal = subtotal;
        order.total = subtotal + order.tax;

        return order.save();
    }

    private async getNextOrderNumber(restaurantId: string | Types.ObjectId): Promise<number> {
        const counterId = `${restaurantId.toString()}_order`;

        const counter = await this.orderCounterModel.findByIdAndUpdate(
            counterId,
            { $inc: { sequence: 1 }, updatedAt: new Date() },
            { new: true, upsert: true },
        );

        return counter.sequence;
    }

    async getTodayOrders(restaurantId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return this.orderModel
            .find({
                restaurantId,
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
            })
            .populate('tableId', 'name displayName')
            .populate('waiterId', 'nickname email')
            .sort({ createdAt: -1 })
            .exec();
    }

    async getOrdersByDate(restaurantId: string | Types.ObjectId, date: Date): Promise<OrderDocument[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.findAll(restaurantId, undefined, undefined, startOfDay, endOfDay);
    }
}
