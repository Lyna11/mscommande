import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { OrderService } from '../services/orderService';
import { OrderToCreateDto } from '../dto/orderToCreateDto';
import { OrderCreatedDto } from 'src/dto/orderCreatedDto';

@Controller('api')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order')
  @HttpCode(200)
  async createOrder(
    @Body() orderToCreateDto: OrderToCreateDto,
  ): Promise<OrderCreatedDto> {
    //return ordercreatedDto
    const orderCreated = await this.orderService.createOrder(orderToCreateDto);
    return { id: orderCreated.id };
  }
}
