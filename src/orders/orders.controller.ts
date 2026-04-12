import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  AddOrderItemsDto,
  UpdateOrderDto,
} from './dto/order.dto';
import { OrderStatus } from './schemas/order.schema';
import { TablesService } from '../tables/tables.service';
import { TableStatus } from '../tables/schemas/table.schema';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
    private readonly tablesService: TablesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      console.log(
        '📋 Creating order with data:',
        JSON.stringify(
          {
            restaurantId: req.user.restaurantId,
            waiterId: req.user.userId,
            tableId: createOrderDto.tableId,
            itemsCount: createOrderDto.items?.length,
            items: createOrderDto.items,
          },
          null,
          2,
        ),
      );

      const table = await this.tablesService.findById(createOrderDto.tableId);
      if (!table) throw new NotFoundException('Table not found');
      if (table.status !== TableStatus.AVAILABLE) {
        throw new ConflictException('Table is already occupied');
      }

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
      this.ordersGateway.emitOrderCreated(
        req.user.restaurantId.toString(),
        order,
      );
      this.ordersGateway.emitKitchenAlert(req.user.restaurantId.toString(), {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
      });

      console.log('✅ Order created successfully:', order.orderNumber);
      return order;
    } catch (error: any) {
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
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: OrderStatus,
    @Query('tableId') tableId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      return await this.ordersService.findAll(
        req.user.restaurantId,
        status,
        tableId,
        start,
        end,
      );
    } catch (error) {
      console.error('Find all orders error:', error);
      throw error;
    }
  }

  @Get('today')
  @HttpCode(HttpStatus.OK)
  async getTodayOrders(@Req() req: AuthenticatedRequest) {
    try {
      return await this.ordersService.getOrdersByDate(
        req.user.restaurantId,
        new Date(),
      );
    } catch (error) {
      console.error('Get today orders error:', error);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      return await this.ordersService.findById(id);
    } catch (error) {
      console.error('Find one order error:', error);
      throw error;
    }
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const existingOrder = await this.ordersService.findById(id);
      if (!existingOrder) throw new NotFoundException('Order not found');
      if (
        existingOrder.status === OrderStatus.SERVED ||
        existingOrder.status === OrderStatus.CANCELLED
      ) {
        throw new ConflictException(
          'Order is already closed and cannot be modified',
        );
      }

      const order = await this.ordersService.updateStatus(
        id,
        updateOrderStatusDto.status,
      );

      if (order) {
        // Emit order update to all tablets
        this.ordersGateway.emitOrderUpdated(
          req.user.restaurantId.toString(),
          order,
        );

        // If order is served or cancelled, release table and notify floor plan
        if (
          updateOrderStatusDto.status === OrderStatus.SERVED ||
          updateOrderStatusDto.status === OrderStatus.CANCELLED
        ) {
          const updatedTable = await this.tablesService.updateStatus(
            order.tableId,
            TableStatus.AVAILABLE,
          );
          if (updatedTable) {
            // Broadcast to all tablets so floor plan updates without reload
            this.ordersGateway.emitTableStatusChanged(
              req.user.restaurantId.toString(),
              updatedTable,
            );
          }
        }
      }

      return order;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  @Patch(':id/items')
  @HttpCode(HttpStatus.OK)
  async addItems(
    @Param('id') id: string,
    @Body() addOrderItemsDto: AddOrderItemsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const existingOrder = await this.ordersService.findById(id);
      if (!existingOrder) throw new NotFoundException('Order not found');
      if (
        existingOrder.status === OrderStatus.SERVED ||
        existingOrder.status === OrderStatus.CANCELLED
      ) {
        throw new ConflictException(
          'Order is already closed and cannot be modified',
        );
      }

      const order = await this.ordersService.addItems(
        id,
        addOrderItemsDto.items,
      );

      if (order) {
        this.ordersGateway.emitOrderUpdated(
          req.user.restaurantId.toString(),
          order,
        );
      }

      return order;
    } catch (error) {
      console.error('Add items to order error:', error);
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const existingOrder = await this.ordersService.findById(id);
      if (!existingOrder) throw new NotFoundException('Order not found');
      if (
        existingOrder.status === OrderStatus.SERVED ||
        existingOrder.status === OrderStatus.CANCELLED
      ) {
        throw new ConflictException(
          'Order is already closed and cannot be modified',
        );
      }

      if (updateOrderDto.baseUpdatedAt && existingOrder.updatedAt) {
        if (
          existingOrder.updatedAt.toISOString() !== updateOrderDto.baseUpdatedAt
        ) {
          throw new ConflictException(
            'Order was modified by another waiter. Please close the cart and reload to refresh.',
          );
        }
      }

      console.log(
        `📝 Updating order ${id} with ${updateOrderDto.items.length} items`,
      );
      const order = await this.ordersService.update(id, updateOrderDto);
      if (order) {
        this.ordersGateway.emitOrderUpdated(
          req.user.restaurantId.toString(),
          order,
        );
      }
      return order;
    } catch (error) {
      console.error('Update order error:', error);
      throw error;
    }
  }
}
