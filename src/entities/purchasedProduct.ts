import { Entity, ManyToOne, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { Order } from './order'; // Référence à l'entité Order (Commande)
import { Product } from './product'; // Référence à l'entité Product (Produit)

@Entity('purchased_products')
export class PurchasedProduct extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Order, (order) => order.products)
  order: Order; // Référence à la commande à laquelle le produit appartient

  @ManyToOne(() => Product, (product) => product.purchasedProducts)
  product: Product; // Référence au produit acheté

  @Column()
  quantity: number; // Quantité de ce produit dans la commande
}
