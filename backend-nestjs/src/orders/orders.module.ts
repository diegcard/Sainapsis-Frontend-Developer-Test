import { Module } from "@nestjs/common";
import { OrdersController } from "@orders/orders.controller";
import { OrdersService } from "@orders/orders.service";
import { OrdersRepository } from "@orders/orders.repository";

@Module({
	controllers: [OrdersController],
	providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
