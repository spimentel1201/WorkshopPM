import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus, FileText, CheckCircle, XCircle, Filter } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/EmptyState';
import { useQuotes } from '@/hooks/useQuotes';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import colors from '@/constants/colors';
import { QuoteStatus } from '@/types/quote';

export default function BudgetsScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { getQuotes, updateQuoteStatus } = useQuotes();
  
  const { data: quotes, isLoading, error } = getQuotes;

  // Filter quotes based on search query
  const filteredQuotes = useMemo(() => {
    if (!quotes) return [];
    return quotes.filter(quote => 
      quote.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.repairOrder?.device?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quotes, searchQuery]);

  const handleCreateBudget = () => {
    router.push('/budgets/create');
  };

  const handleStatusChange = (quoteId: string, status: QuoteStatus) => {
    updateQuoteStatus.mutate({ id: quoteId, status });
  };

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      [QuoteStatus.PENDING]: { label: 'Pendiente', color: colors.orange[500] },
      [QuoteStatus.APPROVED]: { label: 'Aprobado', color: colors.green[500] },
      [QuoteStatus.REJECTED]: { label: 'Rechazado', color: colors.red[500] },
      [QuoteStatus.EXPIRED]: { label: 'Expirado', color: colors.gray[500] },
    };
    
    return statusConfig[status] || { label: status, color: colors.gray[500] };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando presupuestos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar los presupuestos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Presupuestos</Text>
        <Button onPress={handleCreateBudget} variant="primary">
          <Plus size={20} color="white" />
          <Text style={styles.buttonText}>Nuevo Presupuesto</Text>
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.neutral[600]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar presupuestos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.neutral[600]}
            />
        </View>
        <Pressable 
          style={styles.filterButton}
          onPress={() => {
            // TODO: Implement filter modal
          }}
        >
          <Filter size={20} color={colors.primary[500]} />
        </Pressable>
      </View>

      {filteredQuotes?.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} color={colors.primary[400]} />}
          title="No hay presupuestos"
          description={searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'Comienza creando un nuevo presupuesto'}
          onAction={handleCreateBudget}
        />
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const status = getStatusBadge(item.status);
            return (
              <Pressable onPress={() => router.push(`/budgets/${item.id}`)}>
                <Card style={styles.quoteCard}>
                  <View style={styles.quoteHeader}>
                    <Text style={styles.customerName}>
                      {item.customer?.name || 'Cliente no especificado'}
                    </Text>
                    <Badge text={status.label} variant="primary" />
                  </View>
                  
                  <View style={styles.quoteInfo}>
                    <Text style={styles.device}>
                      {item.repairOrder?.device || 'Dispositivo no especificado'}
                    </Text>
                    <Text style={styles.quoteId}>
                      #{item.id.slice(0, 6).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.quoteFooter}>
                    <Text style={styles.amount}>
                      Total: ${item.totalAmount.toFixed(2)}
                    </Text>
                    
                    {user?.role === UserRole.TECHNICIAN && item.status === QuoteStatus.PENDING && (
                      <View style={styles.actions}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onPress={() => {
                            handleStatusChange(item.id, QuoteStatus.APPROVED);
                          }}
                          style={styles.actionButton}
                        >
                          <CheckCircle size={16} style={{ marginRight: 4 }} />
                          Aprobar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onPress={() => {
                            handleStatusChange(item.id, QuoteStatus.REJECTED);
                          }}
                          style={[styles.actionButton, { borderColor: colors.red[500] }]}
                        >
                          <XCircle size={16} style={{ marginRight: 4 }} />
                          Rechazar
                        </Button>
                      </View>
                    )}
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[900],
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  listContent: {
    paddingBottom: 16,
  },
  quoteCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[900],
    flex: 1,
    marginRight: 8,
  },
  quoteInfo: {
    marginBottom: 12,
  },
  device: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  quoteId: {
    fontSize: 13,
    color: colors.neutral[500],
    fontFamily: 'monospace',
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[700],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.red[500],
    fontSize: 16,
    textAlign: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});
