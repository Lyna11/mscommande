import { PurchasedProductDto } from './purchasedProductDto';
export interface OrderDetailsDto {
  id: string;
  status: string;
  products: PurchasedProductDto[];
}
