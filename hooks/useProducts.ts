import api from '@/src/lib/api';
import {
  CreateProductDto,
  Product,
  ProductSearchParams,
  UpdateProductDto,
  UpdateStockDto
} from '@/types/inventory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useProducts = (searchParams?: ProductSearchParams) => {
  const queryClient = useQueryClient();

  // Get all products
  const getProducts = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/products');
      return response.data;
    },
  });

  // Get product categories
  const getCategories = useQuery<string[], Error>({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      const response = await api.get<string[]>('/products/categories');
      return response.data;
    },
  });

  // Search products
  const searchProducts = useQuery<Product[], Error>({
    queryKey: ['products', 'search', searchParams],
    queryFn: async () => {
      if (!searchParams?.query) return [];
      const response = await api.get<Product[]>('/products/search', { 
        params: { query: searchParams.query } 
      });
      return response.data;
    },
    enabled: !!searchParams?.query,
  });

  // Create product
  const createProduct = useMutation<Product, Error, CreateProductDto>({
    mutationFn: async (data) => {
      const response = await api.post<Product>('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update product
  const updateProduct = useMutation<Product, Error, { id: string; data: UpdateProductDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<Product>(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });

  // Update stock
  const updateStock = useMutation<Product, Error, { id: string; data: UpdateStockDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<Product>(`/products/${id}/stock`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });

  // Delete product
  const deleteProduct = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    // Queries
    getProducts,
    searchProducts,
    getCategories,
    
    // Mutations
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
  };
};

export default useProducts;
