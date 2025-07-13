export interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    brand?: string;
    model?: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface SaleItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }
  
  export enum PaymentMethod {
    CASH = 'CASH',
    YAPE = 'YAPE',
    CARD = 'CARD'
  }
  
  export interface PaymentDetails {
    method: PaymentMethod;
    amount: number;
    reference?: string; // For Yape operation code or card reference
    phoneNumber?: string; // For Yape
    receivedAmount?: number; // For cash to calculate change
    change?: number; // For cash
  }
  
  export interface Sale {
    id: string;
    items: SaleItem[];
    subtotal: number;
    tax: number;
    total: number;
    payment: PaymentDetails;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    createdAt: string;
    updatedAt: string;
  }