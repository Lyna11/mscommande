import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order';
import { Product } from './entities/product';
import { PurchasedProduct } from './entities/purchasedProduct';
import { OrderController } from './controllers/orderController';
import { OrderService } from './services/orderService';
import { ProductService } from './services/productService';
import { StockService } from './services/stockService';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // Importe le module TypeOrmModule
    TypeOrmModule.forFeature([Order]),
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([PurchasedProduct]),
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [
    // Ajoute les services ici
    OrderService,
    ProductService,
    StockService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
