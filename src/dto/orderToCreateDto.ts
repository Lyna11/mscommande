import { PurchasedProductDto } from 'src/dto/purchasedProductDto';

export interface OrderToCreateDto {
  products: PurchasedProductDto[];
}
