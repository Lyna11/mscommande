import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  // Simuler une fonction pour obtenir les détails d'un produit
  getProductDetails(productId: string): any {
    // Par exemple, interroger un microservice de catalogue de produits
    const product = {
      id: productId,
      name: 'Produit Exemple',
      price: 10.0,
    };
    return product; // Retourner un produit fictif
  }
}
