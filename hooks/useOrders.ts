import api from '@/src/lib/api';
import { 
  RepairOrder, 
  CreateRepairOrderDto, 
  UpdateRepairOrderDto, 
  UpdateRepairOrderStatusDto,
  RepairOrderResponseDto,
  toRepairOrder
} from '@/types/repair';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useOrders = () => {
  const queryClient = useQueryClient();
  
  // Helper function to convert RepairOrderResponseDto to RepairOrder
  const convertToRepairOrder = (data: RepairOrderResponseDto): RepairOrder => toRepairOrder(data);
  
  // Crear orden
  const createOrder = useMutation<RepairOrder, Error, CreateRepairOrderDto>({
    mutationFn: async (data) => {
      const response = await api.post<RepairOrderResponseDto>('/repair-orders', data);
      return convertToRepairOrder(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
    }
  });

  // Actualizar orden
  const updateOrder = useMutation<RepairOrder, Error, { id: string; data: UpdateRepairOrderDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<RepairOrderResponseDto>(`/repair-orders/${id}`, data);
      return convertToRepairOrder(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
      queryClient.invalidateQueries({ queryKey: ['repair-order', data.id] });
    }
  });

  // Obtener orden por ID
  const getOrder = (id: string) => {
    return useQuery<RepairOrder, Error>({
      queryKey: ['repair-order', id],
      queryFn: async () => {
        const response = await api.get<RepairOrderResponseDto>(`/repair-orders/${id}`);
        return convertToRepairOrder(response.data);
      },
      enabled: !!id
    });
  };

  // Eliminar orden
  const deleteOrder = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/repair-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
    }
  });

  // Cambiar estado de orden
  const updateOrderStatus = useMutation<RepairOrder, Error, { id: string; status: UpdateRepairOrderStatusDto }>({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch<RepairOrderResponseDto>(`/repair-orders/${id}/status`, status);
      return convertToRepairOrder(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
      queryClient.invalidateQueries({ queryKey: ['repair-order', data.id] });
    }
  });

  // Obtener todas las órdenes
  const getOrders = () => {
    return useQuery<RepairOrder[], Error>({
      queryKey: ['repair-orders'],
      queryFn: async () => {
        try {
          const response = await api.get<RepairOrderResponseDto[]>('/repair-orders');
          return response.data.map(convertToRepairOrder);
        } catch (error) {
          throw error;
        }
      }
    });
  };

  return {
    createOrder,
    updateOrder,
    getOrder,
    deleteOrder,
    updateOrderStatus,
    getOrders
  };
};