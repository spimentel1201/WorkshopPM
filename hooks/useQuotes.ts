import api from '@/src/lib/api';
import { CreateQuoteDto, Quote, QuoteItem, QuoteStatus } from '@/types/quote';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useQuotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get all quotes
  const getQuotes = useQuery<Quote[]>({
    queryKey: ['quotes'],
    queryFn: async () => {
      console.log('Fetching quotes with populate...');
      try {
        // Try different API parameter formats
        let response;
        try {
          response = await api.get<Quote[]>('/quotes?populate=repairOrder.devices,customer,technician');
          console.log('Success with populate format');
        } catch (error) {
          console.log('Populate format failed, trying include...');
          response = await api.get<Quote[]>('/quotes?include=repairOrder.devices,customer,technician');
          console.log('Success with include format');
        }
        
        console.log('Quotes API response:', response.data);
        console.log('First quote repairOrder:', response.data?.[0]?.repairOrder);
        console.log('First quote repairOrder devices:', response.data?.[0]?.repairOrder?.devices);
        return response.data;
      } catch (error) {
        console.log('All formats failed, trying basic fetch...');
        const response = await api.get<Quote[]>('/quotes');
        console.log('Basic quotes response:', response.data);
        return response.data;
      }
    },
    enabled: !!user?.id,
  });

  // Get a single quote by ID
  const getQuoteById = (id: string) => {
    return useQuery<Quote>({
      queryKey: ['quotes', id],
      queryFn: async () => {
        console.log(`Fetching quote ${id} with populate...`);
        try {
          // Try different API parameter formats
          let response;
          try {
            response = await api.get<Quote>(`/quotes/${id}?populate=repairOrder.devices,customer,technician`);
            console.log('Success with populate format');
          } catch (error) {
            console.log('Populate format failed, trying include...');
            response = await api.get<Quote>(`/quotes/${id}?include=repairOrder.devices,customer,technician`);
            console.log('Success with include format');
          }
          
          console.log('Quote API response:', response.data);
          console.log('Quote repairOrder:', response.data?.repairOrder);
          console.log('Quote repairOrder devices:', response.data?.repairOrder?.devices);
          return response.data;
        } catch (error) {
          console.log('All formats failed, trying basic fetch...');
          const response = await api.get<Quote>(`/quotes/${id}`);
          console.log('Basic quote response:', response.data);
          return response.data;
        }
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
