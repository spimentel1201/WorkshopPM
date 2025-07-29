// hooks/useClients.ts
import api from '@/src/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateClientDto {
  name: string;
  email?: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export const useClients = () => {
  const queryClient = useQueryClient();
  
  const createClient = useMutation<Client, Error, CreateClientDto>({
    mutationFn: async (data) => {
      const response = await api.post<Client>('/customers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  return { createClient };
};