import api from '@/src/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Quote, QuoteStatus, CreateQuoteDto, QuoteItem } from '@/types/quote';
import { useAuth } from './useAuth';

export const useQuotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get all quotes
  const getQuotes = useQuery<Quote[]>({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await api.get<Quote[]>('/quotes');
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Get a single quote by ID
  const getQuoteById = (id: string) => {
    return useQuery<Quote>({
      queryKey: ['quotes', id],
      queryFn: async () => {
        const response = await api.get<Quote>(`/quotes/${id}`);
        return response.data;
      },
      enabled: !!id && !!user?.id,
    });
  };

  // Create a new quote
  const createQuote = useMutation<Quote, Error, Omit<CreateQuoteDto, 'technicianId' | 'status'>>({
    mutationFn: async (data) => {
      const response = await api.post<Quote>('/quotes', {
        ...data,
        technicianId: user?.id,
        status: QuoteStatus.PENDING,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  // Update quote status
  const updateQuoteStatus = useMutation<Quote, Error, { id: string; status: QuoteStatus }>({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch<Quote>(`/quotes/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
    },
  });

  // Update an existing quote
  const updateQuote = useMutation<Quote, Error, { id: string; data: Partial<Quote> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<Quote>(`/quotes/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedQuote) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.setQueryData(['quotes', updatedQuote.id], updatedQuote);
    },
  });

  // Calculate total amount from items
  const calculateTotal = (items: QuoteItem[]): number => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return {
    // Queries
    getQuotes,
    getQuoteById,
    
    // Mutations
    createQuote,
    updateQuoteStatus,
    updateQuote,
    
    // Utils
    calculateTotal,
  };
};
