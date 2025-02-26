import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { PurchasedProduct } from './purchasedProduct'; // Entité Produit acheté
import { OrderStatusDto } from '../dto/orderStatusDto'; // Enumération du statut de la commande

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string; // Identifiant unique de la commande

  @Column({
    type: 'enum',
    enum: OrderStatusDto,
    default: OrderStatusDto.Pending,
  })
  status: OrderStatusDto; // Statut de la commande (Pending, Delivered, etc.)

  @OneToMany(
    () => PurchasedProduct,
    (purchasedProduct) => purchasedProduct.order,
    {
      cascade: true, // Permet de gérer les produits dans la commande
    },
  )
  products: PurchasedProduct[]; // Liste des produits achetés dans cette commande
}
