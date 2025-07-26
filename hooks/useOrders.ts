import api from '@/src/lib/api';
import { 
  RepairOrder, 
  CreateRepairOrderDto, 
  UpdateRepairOrderDto, 
  UpdateRepairOrderStatusDto 
} from '@/types/repair';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useOrders = () => {
  const queryClient = useQueryClient();
  
  // Crear orden
  const createOrder = useMutation<RepairOrder, Error, CreateRepairOrderDto>({
    mutationFn: async (data) => {
      const response = await api.post<RepairOrder>('/repair-orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-orders'] });
    }
  });

  // Actualizar orden
  const updateOrder = useMutation<RepairOrder, Error, { id: string; data: UpdateRepairOrderDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<RepairOrder>(`/repair-orders/${id}`, data);
      return response.data;
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
        const response = await api.get<RepairOrder>(`/repair-orders/${id}`);
        return response.data;
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
      const response = await api.patch<RepairOrder>(`/repair-orders/${id}/status`, status);
      return response.data;
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
        const response = await api.get<RepairOrder[]>('/repair-orders');
        return response.data;
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