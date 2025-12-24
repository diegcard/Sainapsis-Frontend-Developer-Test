import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from '@orders/orders.service';
import { CreateOrderDto } from '@orders/dto/create-order.dto';
import { TransitionOrderDto } from '@orders/dto/transition-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }

  @Get(':id/actions')
  getAvailableActions(@Param('id') orderId: string) {
    return this.ordersService.getAvailableActions(orderId);
  }

  @Patch(':id/transition')
  executeTransition(
    @Param('id') orderId: string,
    @Body() transitionDto: TransitionOrderDto,
  ) {
    return this.ordersService.executeTransition(orderId, transitionDto);
  }

  @Get('transitions/all')
  getAllTransitions() {
    return this.ordersService.getAllTransitions();
  }

  @Get(':id/transitions')
  getTransitionsByOrderId(@Param('id') orderId: string) {
    return this.ordersService.getTransitionsByOrderId(orderId);
  }
}