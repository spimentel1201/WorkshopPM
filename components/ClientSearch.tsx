import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Pressable, Modal } from 'react-native';
import { Search, User, Phone, Mail, MapPin, Hash, Plus, X } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { Client } from '@/types/repair';

interface ClientSearchProps {
  onClientSelect: (client: Partial<Client>) => void;
  selectedClient?: Partial<Client>;
}

// Mock clients data
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Juan Carlos Pérez',
    phone: '+51 987654321',
    email: 'juan.perez@email.com',
    dni: '12345678',
    address: 'Av. Larco 123, Miraflores, Lima',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'María González',
    phone: '+51 912345678',
    email: 'maria.gonzalez@email.com',
    dni: '87654321',
    address: 'Jr. Cusco 456, Cercado de Lima, Lima',
    createdAt: '2025-01-02T11:00:00Z',
    updatedAt: '2025-01-02T11:00:00Z',
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    phone: '+51 998877665',
    email: 'carlos.rodriguez@email.com',
    dni: '11223344',
    address: 'Av. Brasil 789, Magdalena, Lima',
    createdAt: '2025-01-03T12:00:00Z',
    updatedAt: '2025-01-03T12:00:00Z',
  },
  {
    id: '4',
    name: 'Ana Lucia Torres',
    phone: '+51 955443322',
    email: 'ana.torres@email.com',
    dni: '44332211',
    address: 'Calle Los Olivos 321, San Isidro, Lima',
    createdAt: '2025-01-04T13:00:00Z',
    updatedAt: '2025-01-04T13:00:00Z',
  },
  {
    id: '5',
    name: 'Roberto Silva',
    phone: '+51 977889900',
    dni: '55667788',
    address: 'Av. Javier Prado 654, San Borja, Lima',
    createdAt: '2025-01-05T14:00:00Z',
    updatedAt: '2025-01-05T14:00:00Z',
  },
];

export function ClientSearch({ onClientSelect, selectedClient }: ClientSearchProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // New client form state
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    dni: '',
    address: '',
  });

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = mockClients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        (client.dni && client.dni.includes(searchQuery)) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredClients(filtered);
      setShowResults(true);
    } else {
      setFilteredClients([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleClientSelect = (client: Client) => {
    onClientSelect({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      dni: client.dni,
      address: client.address,
    });
    setSearchQuery(client.name);
    setShowResults(false);
  };

  const handleCreateNewClient = () => {
    if (!newClient.name.trim() || !newClient.phone.trim()) {
      return;
    }

    const client: Partial<Client> = {
      id: Date.now().toString(),
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim() || undefined,
      dni: newClient.dni.trim() || undefined,
      address: newClient.address.trim() || undefined,
    };

    onClientSelect(client);
    setSearchQuery(client.name);
    setShowResults(false);
    setShowNewClientModal(false);
    setNewClient({ name: '', phone: '', email: '', dni: '', address: '' });
  };

  const clearSelection = () => {
    setSearchQuery('');
    setShowResults(false);
    onClientSelect({});
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <Pressable onPress={() => handleClientSelect(item)}>
      <View style={[styles.clientItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.clientInfo}>
          <View style={styles.clientHeader}>
            <User size={16} color={theme.primary[500]} />
            <Text style={[styles.clientName, { color: theme.text.primary }]}>{item.name}</Text>
          </View>
          
          <View style={styles.clientDetails}>
            <View style={styles.clientDetail}>
              <Phone size={12} color={theme.text.tertiary} />
              <Text style={[styles.clientDetailText, { color: theme.text.secondary }]}>{item.phone}</Text>
            </View>
            
            {item.dni && (
              <View style={styles.clientDetail}>
                <Hash size={12} color={theme.text.tertiary} />
                <Text style={[styles.clientDetailText, { color: theme.text.secondary }]}>{item.dni}</Text>
              </View>
            )}
            
            {item.email && (
              <View style={styles.clientDetail}>
                <Mail size={12} color={theme.text.tertiary} />
                <Text style={[styles.clientDetailText, { color: theme.text.secondary }]}>{item.email}</Text>
              </View>
            )}
            
            {item.address && (
              <View style={styles.clientDetail}>
                <MapPin size={12} color={theme.text.tertiary} />
                <Text style={[styles.clientDetailText, { color: theme.text.secondary }]} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            )}
          </View>
        </View>
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
            placeholder="Buscar por nombre, teléfono o DNI..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          {filteredClients.length > 0 ? (
            <FlatList
              data={filteredClients}
              renderItem={renderClientItem}
              keyExtractor={item => item.id}
              style={styles.resultsList}
              nestedScrollEnabled
            />
          ) : (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: theme.text.secondary }]}>
                No se encontraron clientes
              </Text>
              <Button
                onPress={() => setShowNewClientModal(true)}
                size="sm"
                leftIcon={<Plus size={16} color={theme.white} />}
              >
                Crear nuevo cliente
              </Button>
            </View>
          )}
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
              value={newClient.name}
              onChangeText={(value) => setNewClient(prev => ({ ...prev, name: value }))}
            />
            
            <Input
              label="Teléfono *"
              placeholder="Ingrese el número de teléfono"
              value={newClient.phone}
              onChangeText={(value) => setNewClient(prev => ({ ...prev, phone: value }))}
              keyboardType="phone-pad"
            />
            
            <Input
              label="DNI / Documento"
              placeholder="Ingrese el número de documento"
              value={newClient.dni}
              onChangeText={(value) => setNewClient(prev => ({ ...prev, dni: value }))}
              keyboardType="numeric"
            />
            
            <Input
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={newClient.email}
              onChangeText={(value) => setNewClient(prev => ({ ...prev, email: value }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Dirección"
              placeholder="Ingrese la dirección completa"
              value={newClient.address}
              onChangeText={(value) => setNewClient(prev => ({ ...prev, address: value }))}
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
                disabled={!newClient.name.trim() || !newClient.phone.trim()}
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
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginLeft: 8,
  },
  clientDetails: {
    gap: 4,
  },
  clientDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientDetailText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    marginBottom: 12,
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