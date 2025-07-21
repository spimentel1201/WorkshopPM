export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface UpdateStockDto {
  stock: number;
  adjustment?: number; // Optional field for relative stock adjustment
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface ProductFilterParams extends Omit<ProductSearchParams, 'query'> {
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleItem {
  id?: string;
  productId: string;
  productName?: string; // Add this field to include product name in the response dat
  quantity: number;
  price: number;
  totalPrice?: number;
}

export enum PaymentMethod {
  CASH = 'CASH',
  YAPE = 'YAPE',
  CREDIT_CARD = 'CREDIT CARD'
}

export interface PaymentDetails {
  method: PaymentMethod;
  amount?: number;
  reference?: string;
  phoneNumber?: string;
  receivedAmount?: number;
  change?: number;
}

export interface Sale {
  id?: string;
  items: SaleItem[];
  subtotal?: number;
  total?: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}