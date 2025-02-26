import { StockMovementType } from './stockMovementType';
export interface StockMovementDto {
  productId: string;
  quantity: number;
  status: StockMovementType;
}
