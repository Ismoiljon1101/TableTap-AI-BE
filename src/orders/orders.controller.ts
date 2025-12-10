import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto, UpdateOrderStatusDto, AddOrderItemsDto } from './dto/order.dto';
import { OrderStatus } from './schemas/order.schema';
import { TablesService } from '../tables/tables.service';
import { TableStatus } from '../tables/schemas/table.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly ordersGateway: OrdersGateway,
        private readonly tablesService: TablesService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
        try {
            console.log('📋 Creating order with data:', JSON.stringify({
                restaurantId: req.user.restaurantId,
                waiterId: req.user.userId,
                tableId: createOrderDto.tableId,
                itemsCount: createOrderDto.items?.length,
                items: createOrderDto.items,
            }, null, 2));

            const order = await this.ordersService.create(
                req.user.restaurantId,
                req.user.userId,
                createOrderDto,
            );

            // Update table status
            await this.tablesService.updateStatus(
                createOrderDto.tableId,
                TableStatus.OCCUPIED,
                order._id,
            );

            // Emit real-time event
            this.ordersGateway.emitOrderCreated(req.user.restaurantId, order);
            this.ordersGateway.emitKitchenAlert(req.user.restaurantId, {
                orderId: order._id,
                orderNumber: order.orderNumber,
                tableId: order.tableId,
            });

            console.log('✅ Order created successfully:', order.orderNumber);
            return order;
        } catch (error) {
            console.error('❌ Error creating order:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                dto: createOrderDto,
            });
            throw error;
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Req() req: any,
        @Query('status') status?: OrderStatus,
        @Query('tableId') tableId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        return this.ordersService.findAll(req.user.restaurantId, status, tableId, start, end);
    }

    @Get('today')
    @HttpCode(HttpStatus.OK)
    async getTodayOrders(@Req() req: any) {
        return this.ordersService.getOrdersByDate(req.user.restaurantId, new Date());
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return this.ordersService.findById(id);
    }

    @Put(':id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
        @Req() req: any,
    ) {
        const order = await this.ordersService.updateStatus(id, updateOrderStatusDto.status);

        if (order) {
            // Emit real-time event
            this.ordersGateway.emitOrderUpdated(req.user.restaurantId, order);

            // If order is served, update table status
            if (updateOrderStatusDto.status === OrderStatus.SERVED) {
                await this.tablesService.updateStatus(order.tableId, TableStatus.AVAILABLE);
            }
        }

        return order;
    }

    @Put(':id/items')
    @HttpCode(HttpStatus.OK)
    async addItems(
        @Param('id') id: string,
        @Body() addOrderItemsDto: AddOrderItemsDto,
        @Req() req: any,
    ) {
        const order = await this.ordersService.addItems(id, addOrderItemsDto.items);

        if (order) {
            this.ordersGateway.emitOrderUpdated(req.user.restaurantId, order);
        }

        return order;
    }
}
