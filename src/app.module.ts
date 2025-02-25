import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PingController } from './controllers/ping.controller';
import { Order } from './entities/order';
import { Product } from './entities/product';
import { PurchasedProduct } from './entities/purchasedProduct';
import { OrderModule } from './order.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Base de données PostgreSQL
      host: 'localhost', // L'adresse de la base de données, nous allons l'ajuster plus tard pour Docker
      port: 5432, // Port PostgreSQL par défaut
      username: 'commande', // Le nom d'utilisateur PostgreSQL
      password: 'password', // Le mot de passe PostgreSQL
      database: 'mscommande', // Nom de la base de données
      entities: [Order, Product, PurchasedProduct], // Ajoute tes entités ici
      synchronize: true, // Développe en mode synchronisation
    }),
    OrderModule,
  ],
  controllers: [AppController, PingController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
