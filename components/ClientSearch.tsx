import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Pressable, Modal, ActivityIndicator } from 'react-native';
import { Search, User, Phone, Mail, MapPin, Hash, Plus, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { Client } from '@/types/repair';
import api from '@/src/lib/api';

interface ClientSearchProps {
  onClientSelect: (client: Partial<Client>) => void;
  selectedClient?: Partial<Client>;
}

// Search clients from API
const searchClients = async (query: string): Promise<Client[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await api.get<Client[]>('/customers/search', {
      params: { query: query.trim() }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching clients:', error);
    return [];
  }
};
export function ClientSearch({ onClientSelect, selectedClient }: ClientSearchProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      refetch();
    }, 300),
    []
  );

  // Query for searching clients
  const {
    data: clients = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['search-clients', searchQuery],
    queryFn: () => searchClients(searchQuery),
    enabled: !!searchQuery.trim(),
  });

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      setIsSearching(true);
      debouncedSearch(text);
    } else {
      setShowResults(false);
    }
  };

  // Handle client selection
  const handleClientSelect = (client: Partial<Client>) => {
    onClientSelect(client);
    setSearchQuery(client.name || '');
    setShowResults(false);
  };

  // Handle create new client
  const handleCreateNewClient = () => {
    if (!searchQuery.trim()) return;
    
    const newClient: Partial<Client> = {
      id: 'new',
      name: searchQuery.trim(),
      phone: '',
    };
    
    onClientSelect(newClient);
    setShowResults(false);
  };

  // Clear selection
  const clearSelection = () => {
    setSearchQuery('');
    setShowResults(false);
    onClientSelect({});
  };

  // Render client item
  const renderClientItem = ({ item }: { item: Client }) => (
    <Pressable
      style={({ pressed }) => [
        styles.clientItem,
        pressed && { backgroundColor: theme.surface },
      ]}
      onPress={() => handleClientSelect(item)}
    >
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, { color: theme.text.primary }]}>
          {item.name}
        </Text>
        {item.phone && (
          <View style={styles.clientDetail}>
            <Phone size={14} color={theme.text.tertiary} style={styles.icon} />
            <Text style={[styles.clientDetailText, { color: theme.text.secondary }]}>
              {item.phone}
            </Text>
          </View>
        )}
        {item.email && (
          <View style={styles.clientDetail}>
            <Mail size={14} color={theme.text.tertiary} style={styles.icon} />
            <Text style={[styles.clientDetailText, { color: theme.text.secondary }]}>
              {item.email}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text.primary }]}>Cliente</Text>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Buscar cliente..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          {selectedClient?.name && (
            <Pressable onPress={clearSelection} style={styles.clearButton}>
              <X size={16} color={theme.text.tertiary} />
            </Pressable>
          )}
        </View>
        
        <Button
          onPress={() => setShowNewClientModal(true)}
          variant="outline"
          size="sm"
          leftIcon={<Plus size={16} color={theme.primary[500]} />}
        >
          Nuevo
        </Button>
      </View>

      {showResults && (
        <Card style={[styles.resultsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary[500]} />
            </View>
          ) : clients.length > 0 ? (
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id}
              renderItem={renderClientItem}
              keyboardShouldPersistTaps="always"
              style={styles.resultsList}
            />
          ) : searchQuery ? (
            <Pressable
              style={styles.noResults}
              onPress={handleCreateNewClient}
            >
              <Text style={[styles.noResultsText, { color: theme.primary[500] }]}>
                Crear nuevo cliente: {searchQuery}
              </Text>
            </Pressable>
          ) : null}
        </Card>
      )}

      {/* New Client Modal */}
      <Modal
        visible={showNewClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewClientModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Nuevo Cliente</Text>
            <Pressable onPress={() => setShowNewClientModal(false)} style={styles.modalCloseButton}>
              <X size={24} color={theme.text.primary} />
            </Pressable>
          </View>
          
          <View style={styles.modalContent}>
            <Input
              label="Nombre completo *"
              placeholder="Ingrese el nombre completo"
              value={searchQuery}
              onChangeText={(value) => setSearchQuery(value)}
            />
            
            <Input
              label="Teléfono *"
              placeholder="Ingrese el número de teléfono"
              value=""
              onChangeText={(value) => {}}
              keyboardType="phone-pad"
            />
            
            <Input
              label="DNI / Documento"
              placeholder="Ingrese el número de documento"
              value=""
              onChangeText={(value) => {}}
              keyboardType="numeric"
            />
            
            <Input
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value=""
              onChangeText={(value) => {}}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Dirección"
              placeholder="Ingrese la dirección completa"
              value=""
              onChangeText={(value) => {}}
              multiline
              numberOfLines={2}
            />
            
            <View style={styles.modalActions}>
              <Button
                onPress={() => setShowNewClientModal(false)}
                variant="outline"
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button
                onPress={handleCreateNewClient}
                disabled={!searchQuery.trim()}
                style={styles.modalButton}
              >
                Crear Cliente
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  resultsContainer: {
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
  },
  resultsList: {
    maxHeight: 180,
  },
  clientItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  clientDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  clientDetailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  icon: {
    marginRight: 6,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResults: {
    padding: 16,
  },
  noResultsText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});