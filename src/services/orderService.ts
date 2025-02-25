import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order';
import { OrderToCreateDto } from '../dto/orderToCreateDto';
import { PurchasedProduct } from '../entities/purchasedProduct';
import { OrderStatusDto } from '../dto/orderStatusDto';
import { StockService } from './stockService';
import { ProductService } from './productService';
import { OrderCreatedDto } from 'src/dto/orderCreatedDto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ShippingRequestDto } from '../dto/shippingRequestDto';
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly stockService: StockService,
    private readonly productService: ProductService,
    private readonly httpService: HttpService,
  ) {}

  async createOrder(
    OrderCreateDto: OrderToCreateDto,
  ): Promise<OrderCreatedDto> {
    const { products } = OrderCreateDto;

    // 1. Vérification de la disponibilité des produits dans le stock
    for (const product of products) {
      // Vérification de la disponibilité du produit
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const productDetails = await this.productService.getProductDetails(
        product.productId,
      );
      if (!productDetails) {
        throw new NotFoundException(
          `Produit avec l'ID ${product.productId} non trouvé.`,
        );
      }

      // Vérification du stock pour ce produit
      const isAvailable = this.stockService.checkStockAvailability(
        product.productId,
        product.quantity,
      );
      if (!isAvailable) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit avec l'ID ${product.productId}.`,
        );
      }

      // Réservation du produit en stock
      this.stockService.reserveStock(product.productId, product.quantity);
    }

    // 2. Création de la commande avec le statut "PENDING"
    const order = new Order();
    order.status = OrderStatusDto.Pending; // Statut initial de la commande
    order.products = products.map((product) => {
      const purchasedProduct = new PurchasedProduct();
      purchasedProduct.id = product.productId;
      purchasedProduct.quantity = product.quantity;
      return purchasedProduct;
    });

    // Enregistrement de la commande
    const savedOrder = await this.orderRepository.save(order);

    //calcul du nombre total de produits
    const totalProducts = products.reduce(
      (total, product) => total + product.quantity,
      0,
    );

    //preparer la notification pour le systeme de livraison
    const ShippingRequestDto: ShippingRequestDto = {
      orderId: savedOrder.id,
      nbProducts: totalProducts,
    };

    //envoyer la notification au systeme de livraison
    try {
      await this.sendToShippingSystem(ShippingRequestDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(
        "Erreur lors de l'envoi de la notification au système de livraison",
      );
    }
    return { id: savedOrder.id };
  }
  // Fonction pour envoyer la notification au système de livraison
  private async sendToShippingSystem(
    shippingRequestDto: ShippingRequestDto,
  ): Promise<void> {
    const shippingUrl = 'https://shipping-project.onrender.com/api/shipping'; // URL du système de livraison

    try {
      const response = await lastValueFrom(
        this.httpService.post(shippingUrl, shippingRequestDto),
      );
      console.log('Réponse du système de livraison :', response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi à l'API de livraison", error);
      throw new Error("Erreur lors de l'envoi à l'API de livraison");
    }
  }
}
