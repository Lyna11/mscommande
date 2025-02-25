import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { PurchasedProduct } from './purchasedProduct';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Nom du produit

  @Column('text')
  description: string; // Description du produit

  @Column('decimal')
  price: number; // Prix du produit

  @OneToMany(
    () => PurchasedProduct,
    (purchasedProduct) => purchasedProduct.product,
  )
  purchasedProducts: PurchasedProduct[]; // Relation avec les produits achetés
}
