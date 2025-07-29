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
  documentNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairOrderItem {
  id: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  problemDescription: string;
  accessories: string[];
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

export interface RepairOrderResponseDto {
  id: string;
  customerId: string;
  technicianId: string | null;
  status: RepairOrderStatus;
  description: string;
  notes?: string;
  initialReviewCost: number;
  totalCost: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  items: RepairOrderItem[];
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  technician: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface RepairOrder {
  id: string;
  customerId: string;
  technicianId: string;
  status: RepairOrderStatus;
  description: string;
  notes?: string;
  initialReviewCost: number;
  totalCost: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  items: RepairOrderItem[];
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  technician: {
    id: string;
    firstName: string;
    lastName: string;
  };
  // Campos para compatibilidad con el frontend
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  technicianName: string;
  devices: Device[];
  problemDescription?: string; // Mantener para compatibilidad
}

export function toRepairOrder(dto: RepairOrderResponseDto): RepairOrder {
  // Handle case where items array might be empty
  const firstItem = dto.items?.[0];
  
  // Create device object from the first item if it exists
  const device = firstItem ? {
    id: firstItem.id || '',
    brand: firstItem.brand || '',
    model: firstItem.model || '',
    serialNumber: firstItem.serialNumber || '',
    type: (firstItem.deviceType as DeviceType) || DeviceType.OTHER,
    reviewCost: firstItem.price || 0,
    reportedIssue: firstItem.problemDescription || '',
    accessories: (firstItem.accessories || []).map(acc => ({
      id: acc.toLowerCase().replace(/\s+/g, '-'),
      name: acc,
      included: true
    })),
    diagnosis: dto.description || ''
  } : undefined;

  // Create the repair order object with all required fields
  const repairOrder: RepairOrder = {
    id: dto.id || '',
    customerId: dto.customerId || '',
    customerName: dto.customer?.name || 'Cliente',
    customerPhone: dto.customer?.phone || '',
    customerEmail: dto.customer?.email || '',
    status: dto.status || RepairOrderStatus.RECEIVED,
    description: dto.description || '',
    notes: dto.notes || '',
    initialReviewCost: dto.initialReviewCost || 0,
    totalCost: dto.totalCost || 0,
    startDate: dto.startDate || null,
    endDate: dto.endDate || null,
    technicianId: dto.technicianId || '',
    technicianName: dto.technician ? 
      `${dto.technician.firstName || ''} ${dto.technician.lastName || ''}`.trim() : 'Técnico no asignado',
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
    items: dto.items || [],
    customer: dto.customer || {
      id: '',
      name: 'Cliente',
      email: '',
      phone: ''
    },
    technician: dto.technician || {
      id: '',
      firstName: '',
      lastName: ''
    },
    devices: device ? [device] : [],
    problemDescription: dto.description || ''
  };

  return repairOrder;
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

export interface CreateRepairOrderDto {
  customerId?: string;
  technicianId?: string | null;
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

export interface UpdateRepairOrderDto {
  customerId?: string;
  technicianId?: string;
  status?: RepairOrderStatus;
  description?: string;
  notes?: string;
  initialReviewCost?: number;
  items?: CreateRepairOrderItemDto[];
}

export interface UpdateRepairOrderStatusDto {
  status: RepairOrderStatus;
}