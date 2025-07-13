import { useState } from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, isLoading, error } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('El correo electrónico es requerido');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Ingrese un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('La contraseña es requerida');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      login({ email, password });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://placehold.co/200x200/0072ff/FFFFFF.png?text=REPAIR+SHOP' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Taller de Reparación</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Correo Electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.neutral[500]} />}
            error={emailError}
          />

          <Input
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={colors.neutral[500]} />}
            rightIcon={
              showPassword ? (
                <EyeOff size={20} color={colors.neutral[500]} />
              ) : (
                <Eye size={20} color={colors.neutral[500]} />
              )
            }
            onRightIconPress={toggleShowPassword}
            error={passwordError}
          />

          {error && (
            <Text style={styles.errorText}>
              {error instanceof Error ? error.message : 'Error al iniciar sesión'}
            </Text>
          )}

          <Button
            onPress={handleLogin}
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Iniciar Sesión
          </Button>

          <View style={styles.helpText}>
            <Text style={styles.helpTextContent}>
              Credenciales de prueba:
            </Text>
            <Text style={styles.helpTextContent}>
              Admin: admin@example.com / password
            </Text>
            <Text style={styles.helpTextContent}>
              Técnico: tech@example.com / password
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  helpText: {
    marginTop: 24,
    alignItems: 'center',
  },
  helpTextContent: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 4,
  },
});