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
import { StockMovementDto } from '../dto/stockMovementDto';
import { StockMovementType } from '../dto/stockMovementType';
import { OrderDetailsDto } from 'src/dto/orderDetailsDto';
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
      try {
        await this.reserveStockApi(product.productId, product.quantity);
      } catch (error) {
        console.error(
          `Erreur de réservation du stock pour le produit ${product.productId}`,
          error,
        );
        throw new BadRequestException(
          `Impossible de réserver le stock pour le produit ${product.productId}`,
        );
      }
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
      savedOrder.status = OrderStatusDto.Delivered;
      await this.orderRepository.save(savedOrder);
      console.log(`Commande ${savedOrder.id} livrée avec succès`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de la notification au système de livraison",
      );
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

  private async reserveStockApi(
    productId: string,
    quantity: number,
  ): Promise<void> {
    const stockMovement: StockMovementDto = {
      productId,
      quantity,
      status: StockMovementType.Reserve, // On réserve le stock
    };

    const stockUrl = `http://donoma.ddns.net/api/stock/${productId}/movement`; // Remplacez par l'URL réelle

    try {
      const response = await lastValueFrom(
        this.httpService.post(stockUrl, stockMovement),
      );
      console.log(
        `Stock réservé pour le produit ${productId} :`,
        response.data,
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response && error.response.status === 400) {
        console.error(`Stock insuffisant pour le produit ${productId}`);
        throw new BadRequestException(
          `Stock insuffisant pour le produit ${productId}`,
        );
      }

      console.error(
        `Erreur lors de la réservation du stock pour le produit ${productId}`,
        error,
      );
      throw new Error(
        `Impossible de réserver le stock pour le produit ${productId}`,
      );
    }
  }
  async getOrderDetails(orderId: string): Promise<OrderDetailsDto> {
    // Récupération de la commande
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['products'], // Inclure les produits liés à la commande
    });

    // Vérification si la commande existe
    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${orderId} non trouvée.`);
    }

    // Transformation de l'entité en DTO
    const orderDetails: OrderDetailsDto = {
      id: order.id,
      status: order.status,
      products: order.products.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
    };

    return orderDetails;
  }
}
