export interface ColorScheme {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
    white: string;
    black: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    input: {
      background: string;
      placeholder: string;
      text: string;
      border: string;
    };
  }
  
  const lightColors: ColorScheme = {
    primary: {
      50: '#e6f1ff',
      100: '#cce3ff',
      200: '#99c7ff',
      300: '#66aaff',
      400: '#338eff',
      500: '#0072ff',
      600: '#005bcc',
      700: '#004499',
      800: '#002d66',
      900: '#001733',
    },
    secondary: {
      50: '#e6f9ff',
      100: '#ccf3ff',
      200: '#99e7ff',
      300: '#66dbff',
      400: '#33cfff',
      500: '#00c3ff',
      600: '#009ccc',
      700: '#007599',
      800: '#004e66',
      900: '#002733',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#000000',
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
    },
    input: {
      background: '#ffffff',
      placeholder: '#94a3b8',
      text: '#0f172a',
      border: '#e2e8f0',
    },
  };
  
  const darkColors: ColorScheme = {
    primary: {
      50: '#001733',
      100: '#002d66',
      200: '#004499',
      300: '#005bcc',
      400: '#0072ff',
      500: '#338eff',
      600: '#66aaff',
      700: '#99c7ff',
      800: '#cce3ff',
      900: '#e6f1ff',
    },
    secondary: {
      50: '#002733',
      100: '#004e66',
      200: '#007599',
      300: '#009ccc',
      400: '#00c3ff',
      500: '#33cfff',
      600: '#66dbff',
      700: '#99e7ff',
      800: '#ccf3ff',
      900: '#e6f9ff',
    },
    neutral: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#000000',
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    input: {
      background: '#1e293b',
      placeholder: '#64748b',
      text: '#f8fafc',
      border: '#334155',
    },
  };
  
  const colors = lightColors;
  
  export const statusColors = {
    pending: colors.warning,
    inProgress: colors.info,
    completed: colors.success,
    delivered: colors.primary[700],
    cancelled: colors.error,
  };
  
  export { lightColors, darkColors };
  export default colors;