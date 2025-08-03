import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { generateRepairOrderPDF, generateQuotePDF } from '@/services/pdfService';
import { RepairOrder } from '@/types/repair';
import { Quote } from '@/types/quote';

type PDFSettings = {
  logoUri?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
};

const PDF_SETTINGS_KEY = 'pdf_settings';
const DEFAULT_SETTINGS: PDFSettings = {
  companyName: 'Taller de Reparaciones',
  companyAddress: 'Av. Principal 123, Lima, Perú',
  companyPhone: '+51 123 456 789',
  companyEmail: 'contacto@taller.com',
};

export const usePDFGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PDFSettings>(DEFAULT_SETTINGS);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  // Load saved settings on mount
  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await SecureStore.getItemAsync(PDF_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading PDF settings:', error);
    }
  }, []);

  // Save settings to secure storage
  const saveSettings = useCallback(async (newSettings: PDFSettings) => {
    try {
      await SecureStore.setItemAsync(PDF_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving PDF settings:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración del PDF');
      return false;
    }
  }, []);

  // Generate repair order PDF
  const generateRepairOrderPDFWithSettings = useCallback(async (order: RepairOrder) => {
    setIsLoading(true);
    try {
      const result = await generateRepairOrderPDF(order, settings);
      if (!result.success) {
        throw new Error('Error al generar el PDF');
      }
      return result;
    } catch (error) {
      console.error('Error generating repair order PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF de la orden de reparación');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Generate quote PDF
  const generateQuotePDFWithSettings = useCallback(async (quote: Quote) => {
    setIsLoading(true);
    try {
      const result = await generateQuotePDF(quote, settings);
      if (!result.success) {
        throw new Error('Error al generar el PDF');
      }
      return result;
    } catch (error) {
      console.error('Error generating quote PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF del presupuesto');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Show settings modal
  const showSettingsModal = useCallback(() => {
    setIsSettingsModalVisible(true);
  }, []);

  // Handle settings save
  const handleSaveSettings = useCallback(async (newSettings: PDFSettings) => {
    const saved = await saveSettings(newSettings);
    if (saved) {
      setIsSettingsModalVisible(false);
      Alert.alert('Éxito', 'Configuración guardada correctamente');
    }
  }, [saveSettings]);

  return {
    // State
    isLoading,
    settings,
    isSettingsModalVisible,
    
    // Actions
    generateRepairOrderPDF: generateRepairOrderPDFWithSettings,
    generateQuotePDF: generateQuotePDFWithSettings,
    showSettingsModal,
    closeSettingsModal: () => setIsSettingsModalVisible(false),
    saveSettings: handleSaveSettings,
    loadSettings,
  };
};

export default usePDFGenerator;
