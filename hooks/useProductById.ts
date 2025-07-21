// Archivo: hooks/useProductById.js (NUEVO HOOK)

import api from '@/src/lib/api';
import { Product } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';

export const useProductById = (id: string | undefined) => {
  return useQuery<Product, Error>({
    // La queryKey incluye el ID para que sea única para cada producto
    queryKey: ['products', id],
    queryFn: async () => {
      // Aseguramos que no se haga la petición si no hay ID
      if (!id) throw new Error('Product ID is required');
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    },
    // El hook solo se activará si el 'id' existe.
    // Esto es crucial para páginas de edición/detalle donde el ID puede venir de la URL.
    enabled: !!id,
  });
};