import { Controller, Post, Body, HttpCode, Get, Param } from '@nestjs/common';
import { OrderService } from '../services/orderService';
import { OrderToCreateDto } from '../dto/orderToCreateDto';
import { OrderCreatedDto } from 'src/dto/orderCreatedDto';
import { OrderDetailsDto } from 'src/dto/orderDetailsDto';

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(200)
  async createOrder(
    @Body() orderToCreateDto: OrderToCreateDto,
  ): Promise<OrderCreatedDto> {
    //return ordercreatedDto
    const orderCreated = await this.orderService.createOrder(orderToCreateDto);
    return { id: orderCreated.id };
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string): Promise<OrderDetailsDto> {
    return this.orderService.getOrderDetails(orderId);
  }
}
