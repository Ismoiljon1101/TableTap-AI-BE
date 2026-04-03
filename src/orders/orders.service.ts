import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { OrderCounter, OrderCounterDocument } from './schemas/order-counter.schema';
import { CreateOrderDto, UpdateOrderDto, AddOrderItemsDto } from './dto/order.dto';
import { PrinterService } from '../printer/printer.service';
import { toObjectId } from '../libs/config';

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
        const rid = toObjectId(restaurantId);
        const wid = toObjectId(waiterId);
        
        try {
            const { tableId, items } = createOrderDto;

            // Validate items
            if (!items || items.length === 0) {
                throw new Error('Order must contain at least one item');
            }

            // Get next order number
            const orderNumber = await this.getNextOrderNumber(rid);

            // Calculate totals
            const subtotal = items.reduce((sum, item) => {
                const modifiersTotal = item.modifiers?.reduce((modSum, mod) => modSum + mod.price, 0) || 0;
                return sum + (item.unitPrice + modifiersTotal) * item.quantity;
            }, 0);

            const tax = 0;
            const total = subtotal + tax;

            const order = new this.orderModel({
                orderNumber,
                restaurantId: rid,
                tableId: toObjectId(tableId),
                waiterId: wid,
                items,
                subtotal,
                tax,
                total,
                status: OrderStatus.PENDING,
            });

            const savedOrder = await order.save();

            // Populate fields for printer
            const populatedOrder = await savedOrder.populate([
                { path: 'tableId', select: 'name displayName' },
                { path: 'waiterId', select: 'nickname' }
            ]);

            this.printerService.printOrder(populatedOrder).catch(err => {
                console.error('⚠️ Printing failed:', err);
            });

            return savedOrder;
        } catch (error: any) {
            console.error('❌ Error in OrdersService.create:', error);
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
        const rid = toObjectId(restaurantId);
        const filter: any = { restaurantId: rid };

        if (status) {
            filter.status = status;
        }

        if (tableId) {
            filter.tableId = toObjectId(tableId);
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
            .findById(toObjectId(id))
            .populate('tableId')
            .populate('waiterId', 'nickname email')
            .exec();
    }

    async updateStatus(id: string | Types.ObjectId, status: OrderStatus): Promise<OrderDocument | null> {
        const updateData: any = { status };

        if (status === OrderStatus.SERVED) {
            updateData.servedAt = new Date();
        }

        return this.orderModel.findByIdAndUpdate(toObjectId(id), updateData, { new: true }).exec();
    }

    async update(id: string | Types.ObjectId, updateOrderDto: UpdateOrderDto): Promise<OrderDocument | null> {
        const order = await this.orderModel.findById(toObjectId(id));
        if (!order) return null;

        const { items } = updateOrderDto;
        order.items = items as any;

        // Recalculate totals
        const subtotal = items.reduce((sum, item) => {
            const modifiersTotal = item.modifiers?.reduce((modSum, mod) => modSum + mod.price, 0) || 0;
            return sum + (item.unitPrice + modifiersTotal) * item.quantity;
        }, 0);

        order.subtotal = subtotal;
        order.total = subtotal + order.tax;

        return order.save();
    }

    async addItems(id: string | Types.ObjectId, newItems: any[]): Promise<OrderDocument | null> {
        const order = await this.orderModel.findById(toObjectId(id));
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
        const rid = toObjectId(restaurantId);
        const counterId = `${rid.toString()}_order`;

        const counter = await this.orderCounterModel.findByIdAndUpdate(
            counterId,
            { $inc: { sequence: 1 }, updatedAt: new Date() },
            { new: true, upsert: true },
        );

        return counter.sequence;
    }

    async getTodayOrders(restaurantId: string | Types.ObjectId) {
        const rid = toObjectId(restaurantId);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return this.orderModel
            .find({
                restaurantId: rid,
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
