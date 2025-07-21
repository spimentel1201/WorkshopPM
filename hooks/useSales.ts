import api from '@/src/lib/api';
import { Sale } from '@/types/inventory';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSales = () => {
  const queryClient = useQueryClient();
  
  const createSale = useMutation<Sale, Error, Sale>({
    mutationFn: async (data) => {
      const response = await api.post<Sale>('/sales', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    }
  });

  return {
    createSale
  };
};