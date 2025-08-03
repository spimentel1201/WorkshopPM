import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import colors from '@/constants/colors';

type PDFSettings = {
  logoUri?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
};

type PDFSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: PDFSettings) => void;
  initialSettings?: Partial<PDFSettings>;
};

export const PDFSettingsModal: React.FC<PDFSettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings = {},
}) => {
  const [settings, setSettings] = useState<PDFSettings>({
    companyName: 'Taller de Reparaciones',
    companyAddress: 'Av. Principal 123, Lima, Perú',
    companyPhone: '+51 123 456 789',
    companyEmail: 'contacto@taller.com',
    ...initialSettings,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setSettings(prev => ({ ...prev, logoUri: base64Image }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error al seleccionar la imagen');
    }
  };
  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUri: undefined }));
  };

  const handleSubmit = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle]}>
            Configuración del PDF
          </Text>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle]}>
              Logo de la Empresa
            </Text>
            <View style={styles.logoContainer}>
              {settings.logoUri ? (
                <View style={styles.logoPreviewContainer}>
                  <Image 
                    source={{ uri: settings.logoUri }} 
                    style={styles.logoPreview} 
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    style={[styles.removeButton, { backgroundColor: colors.error }]}
                    onPress={handleRemoveLogo}
                  >
                    <Text style={styles.removeButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                >
                  <Text style={styles.uploadButtonText}>
                    Seleccionar Logo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle]}>
              Información de la Empresa
            </Text>
            <Input
              label="Nombre de la Empresa"
              value={settings.companyName}
              onChangeText={(text) => setSettings(prev => ({ ...prev, companyName: text }))}
            />
            <Input
              label="Dirección"
              value={settings.companyAddress}
              onChangeText={(text) => setSettings(prev => ({ ...prev, companyAddress: text }))}
              multiline
              numberOfLines={2}
            />
            <Input
              label="Teléfono"
              value={settings.companyPhone}
              onChangeText={(text) => setSettings(prev => ({ ...prev, companyPhone: text }))}
              keyboardType="phone-pad"
            />
            <Input
              label="Email"
              value={settings.companyEmail}
              onChangeText={(text) => setSettings(prev => ({ ...prev, companyEmail: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              variant="outline"
              onPress={onClose}
              style={[styles.button, { marginRight: 10 }]}
            >
              Cancelar
            </Button>
            <Button
              onPress={handleSubmit}
              style={styles.button}
              loading={isLoading}
            >
              Guardar Configuración
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPreviewContainer: {
    alignItems: 'center',
  },
  logoPreview: {
    width: 150,
    height: 100,
    marginBottom: 10,
  },
  uploadButton: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    flex: 1,
  },
});
