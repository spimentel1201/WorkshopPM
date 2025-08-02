// types/quote.ts
export enum QuoteStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
  }
  
  export interface QuoteItem {
    id?: string;
    quoteId?: string;
    quantity: number;
    price: number;
    description: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Quote {
    id: string;
    repairOrderId: string;
    customerId: string;
    technicianId: string;
    status: QuoteStatus;
    totalAmount: number;
    createdAt?: string;
    updatedAt?: string;
    items: QuoteItem[];
    // Relations from backend
    repairOrder?: {
      id: string;
      customer: {
        id: string;
        name: string;
      };
      device: string;
      devices?: Array<{
        id: string;
        deviceType: string;
        brand: string;
        model: string;
        serialNumber: string;
      }>;
    };
    customer?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    technician?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }
  
  export interface CreateQuoteDto {
    repairOrderId: string;
    customerId: string;
    technicianId: string;
    status?: QuoteStatus;
    totalAmount: number;
    items: Array<{
      quantity: number;
      price: number;
      description: string;
    }>;
  }