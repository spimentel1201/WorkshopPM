import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, Edit, FileText, Mail, Phone, Printer, Share2, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { useQuotes } from '@/hooks/useQuotes';
import { UserRole } from '@/types/auth';
import { QuoteStatus } from '@/types/quote';
import { format } from 'date-fns';

export default function BudgetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { getQuoteById, updateQuoteStatus } = useQuotes();
  const queryClient = useQueryClient();
  
  const { data: quote, isLoading, error } = getQuoteById(id || '');
  
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const {
    isLoading: isGeneratingPDF,
    generateQuotePDF,
  } = usePDFGenerator();

  const handleStatusChange = async (status: QuoteStatus) => {
    if (!id) return;
    
    try {
      if (status === QuoteStatus.APPROVED) setIsApproving(true);
      if (status === QuoteStatus.REJECTED) setIsRejecting(true);
      
      await updateQuoteStatus.mutateAsync({ id, status });
      
      Alert.alert(
        'Éxito',
        `El presupuesto ha sido ${status === QuoteStatus.APPROVED ? 'aprobado' : 'rechazado'} correctamente`
      );
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del presupuesto');
      console.error('Error updating quote status:', error);
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  const handlePrint = async () => {
    if (!quote) return;
    
    const result = await generateQuotePDF(quote);
    if (result.success) {
      console.log(result);
      Alert.alert('Éxito', 'PDF generado correctamente');
    }
  };

  const handleShare = async () => {
    if (!quote) return;
    
    const result = await generateQuotePDF(quote);
    if (result.success) {
      console.log(result);
      Alert.alert('Éxito', 'PDF del presupuesto generado correctamente');
    }
  };

  const handleEdit = (id: string) => {
    if (id) {
      router.push(`/budgets/${id}/edit`);
    }
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
        <Text>Cargando presupuesto...</Text>
      </View>
    );
  }

  if (error || !quote) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el presupuesto</Text>
        <Button onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          Volver
        </Button>
      </View>
    );
  }

  const status = getStatusBadge(quote.status);
  const canEdit = user?.role === UserRole.ADMIN || user?.id === quote.technicianId;
  const canApproveReject = user?.role === UserRole.ADMIN && quote.status === QuoteStatus.PENDING;

  return (
    <>

      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Presupuesto #${quote.id.slice(0, 8).toUpperCase()}</Text>
      <View style={styles.headerActions}>
              <Button
                variant="ghost"
                size="sm"
                onPress={handlePrint}
                style={styles.headerButton}
              >
                <Printer size={20} color={colors.primary[600]} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={handleShare}
                style={styles.headerButton}
              >
                <Share2 size={20} color={colors.primary[600]} />
              </Button>
            </View>
        <View>
          <Text style={styles.amount}>${quote.totalAmount.toFixed(2)}</Text>
          <Badge text={status.label} variant="primary" />
        </View>
        
        {canEdit && (
          <Button onPress={() => handleEdit(quote.id)} variant="outline" size="sm" leftIcon={<Edit size={16} color={colors.primary[600]} />}>
            <Text style={{ color: colors.primary[600] }}>Editar</Text>
          </Button>
        )}
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Cliente</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{quote.customer?.name || 'No especificado'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contacto:</Text>
          <View style={styles.contactInfo}>
            {quote.customer?.email && (
              <View style={styles.contactItem}>
                <Mail size={16} color={colors.gray[500]} style={styles.contactIcon} />
                <Text style={styles.infoValue}>{quote.customer.email}</Text>
              </View>
            )}
            {quote.customer?.phone && (
              <View style={styles.contactItem}>
                <Phone size={16} color={colors.gray[500]} style={styles.contactIcon} />
                <Text style={styles.infoValue}>{quote.customer.phone}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles de la Orden</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Orden #:</Text>
          <Text style={styles.infoValue}>{quote.repairOrderId}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dispositivo:</Text>
          <Text style={styles.infoValue}>
            {quote.repairOrder?.devices?.[0]
              ? `${quote.repairOrder.devices[0].brand} ${quote.repairOrder.devices[0].model}`
              : quote.repairOrder?.device || 'No especificado'
            }
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Técnico:</Text>
          <Text style={styles.infoValue}>{quote.technician?.firstName + ' ' + quote.technician?.lastName || 'No asignado'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creado:</Text>
          <Text style={styles.infoValue}>
            {format(new Date(quote.createdAt || ''), "PP 'a las' hh:mm a")}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Actualizado:</Text>
          <Text style={styles.infoValue}>
            {format(new Date(quote.updatedAt || ''), "PP 'a las' hh:mm a")}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ítems del Presupuesto</Text>
          <Text style={styles.itemsCount}>({quote.items?.length || 0} ítems)</Text>
        </View>
        
        {quote.items?.length ? (
          <View style={styles.itemsList}>
            {quote.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.description}</Text>
                  <Text style={styles.itemPrice}>
                    {item.quantity} x ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  S/{(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            ))}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>S/{quote.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyItems}>
            <FileText size={32} color={colors.gray[300]} />
            <Text style={styles.emptyItemsText}>No hay ítems en este presupuesto</Text>
          </View>
        )}
      </Card>

      {canApproveReject && (
        <View style={styles.actionButtons}>
          <Button 
            onPress={() => handleStatusChange(QuoteStatus.REJECTED)}
            variant="outline"
            style={[styles.actionButton, { borderColor: colors.red[500] }]}
            loading={isRejecting}
            disabled={isApproving || isRejecting}
          >
            <XCircle size={16} style={{ marginRight: 8 }} />
            Rechazar
          </Button>
          
          <Button 
            onPress={() => handleStatusChange(QuoteStatus.APPROVED)}
            variant="primary"
            style={[styles.actionButton, { backgroundColor: colors.green[500] }]}
            loading={isApproving}
            disabled={isApproving || isRejecting}
          >
            <CheckCircle size={16} style={{ marginRight: 8 }} />
            Aprobar
          </Button>
        </View>
      )}
      
      {quote.status === QuoteStatus.PENDING && (
        <View style={styles.noteContainer}>
          <Clock size={16} color={colors.orange[500]} style={styles.noteIcon} />
          <Text style={styles.noteText}>
            Este presupuesto está pendiente de aprobación. Vence en 7 días.
          </Text>
        </View>
      )}
      </ScrollView>
    </>
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
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[200],
  },
  headerActions: {
    flexDirection: 'column',
    marginRight: 8,
  },
  headerButton: {
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  section: {
    marginBottom: 16,
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[900],
  },
  itemsCount: {
    fontSize: 14,
    color: colors.primary[500],
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: colors.primary[600],
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.primary[900],
  },
  contactInfo: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    marginRight: 8,
  },
  itemsList: {
    marginTop: 8,
  },
  itemLabel: {
    width: 100,
    fontSize: 14,
    color: colors.gray[600],
  },
  itemValue: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[900],
  },
  itemIcon: {
    marginRight: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    color: colors.primary[900],
    marginBottom: 4,
  },
  itemPrice: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    color: colors.gray[900],
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[900],
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyItemsText: {
    marginTop: 12,
    color: colors.primary[500],
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    marginLeft: 12,
    minWidth: 120,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.orange[50],
    borderRadius: 8,
    marginBottom: 24,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    color: colors.orange[800],
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.red[500],
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  itemDescription: {
    flex: 2,
    fontSize: 14,
    color: colors.primary[900],
  },
  commentsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  commentsIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  commentsText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary[700],
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  footer: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 8,
    color: colors.primary[500],
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary[600],
  },
  buttonText: {
    color: colors.white,
    fontWeight: '500',
  },
});