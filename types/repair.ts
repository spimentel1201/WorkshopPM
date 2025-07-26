  export enum DeviceType {
    REFRIGERATOR = 'REFRIGERATOR',
    WASHING_MACHINE = 'WASHING_MACHINE',
    DRYER = 'DRYER',
    STOVE = 'STOVE',
    MICROWAVE = 'MICROWAVE',
    TV = 'TV',
    LAPTOP = 'LAPTOP',
    DESKTOP = 'DESKTOP',
    TABLET = 'TABLET',
    SMARTPHONE = 'SMARTPHONE',
    OTHER = 'OTHER'
  }
  
  export interface Accessory {
    id: string;
    name: string;
    included: boolean;
  }
  
  export interface Device {
    id: string;
    brand: string;
    model: string;
    serialNumber: string;
    type: DeviceType;
    reviewCost: number;
    reportedIssue: string;
    accessories: Accessory[];
    diagnosis?: string;
  }
  
  export interface Client {
    id: string;
    name: string;
    phone: string;
    email?: string;
    dni?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface RepairOrder {
    id: string;
    clientId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerDni?: string;
    customerAddress?: string;
    devices: Device[];
    status: RepairOrderStatus;
    technicianId?: string;
    technicianName?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    deliveredAt?: string;
    totalCost?: number;
  }
  
  export interface Budget {
    id: string;
    repairOrderId: string;
    laborCost: number;
    partsCost: number;
    additionalCosts: number;
    additionalCostsDescription?: string;
    totalCost: number;
    approved: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface BudgetItem {
    id: string;
    budgetId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }

export enum RepairOrderStatus {
  RECEIVED = 'RECEIVED',
  DIAGNOSED = 'DIAGNOSED', 
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// DTO para crear una orden
export interface CreateRepairOrderDto {
  customerId: string;
  technicianId: string;
  status: RepairOrderStatus;
  description: string;
  notes: string;
  initialReviewCost: number;
  items: CreateRepairOrderItemDto[];
}

export interface CreateRepairOrderItemDto {
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  problemDescription: string;
  accessories: string[];
  quantity: number;
  price: number;
}

// DTO para actualizar una orden
export interface UpdateRepairOrderDto {
  customerId?: string;
  technicianId?: string;
  status?: RepairOrderStatus;
  description?: string;
  notes?: string;
  initialReviewCost?: number;
  items?: CreateRepairOrderItemDto[];
}

// DTO para cambiar estado
export interface UpdateRepairOrderStatusDto {
  status: RepairOrderStatus;
}