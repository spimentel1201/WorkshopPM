import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('Auth state changed - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Redirecting to /(tabs) from useEffect');
      // Usar setTimeout para asegurar que la navegación ocurra en el siguiente ciclo de eventos
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      const success = await login({ email, password });
      
      if (success) {
        console.log('Login successful, redirecting...');
        // Redirigir inmediatamente después del login exitoso
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Inicio de sesión fallido');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <Input
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={styles.input}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />          
          <Button
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Iniciar Sesión
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 0,
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 0,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#1976d2',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#1976d2',
    fontWeight: '600',
  },
});