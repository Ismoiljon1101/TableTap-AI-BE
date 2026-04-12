import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Join restaurant room
  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(client: Socket, restaurantId: string) {
    client.join(`restaurant_${restaurantId}`);
    console.log(`Client ${client.id} joined restaurant ${restaurantId}`);
    return { event: 'joined', data: restaurantId };
  }

  // Emit order created event
  emitOrderCreated(restaurantId: string, order: any) {
    this.server.to(`restaurant_${restaurantId}`).emit('order-created', order);
  }

  // Emit order updated event
  emitOrderUpdated(restaurantId: string, order: any) {
    this.server.to(`restaurant_${restaurantId}`).emit('order-updated', order);
  }

  // Emit table status changed event
  emitTableStatusChanged(restaurantId: string, table: any) {
    this.server
      .to(`restaurant_${restaurantId}`)
      .emit('table-status-changed', table);
  }

  // Emit kitchen alert
  emitKitchenAlert(restaurantId: string, alert: any) {
    this.server.to(`restaurant_${restaurantId}`).emit('kitchen-alert', alert);
  }
}
