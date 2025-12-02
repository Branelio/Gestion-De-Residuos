// Colores institucionales basados en EPAGAL y Municipio de Latacunga
// Verde: Representa medio ambiente, limpieza y sostenibilidad
// Azul: Representa agua, gestión pública y confianza

export const colors = {
  // Colores primarios - Verde EPAGAL/Ambiental
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',  // Verde principal
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',  // Verde oscuro institucional
  },

  // Colores secundarios - Azul institucional
  secondary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',  // Azul principal
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Colores de estado
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Colores neutrales/grises
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Colores para tipos de reporte
  reportTypes: {
    overflow: '#FF6B6B',      // Rojo - Desbordamiento
    illegalDump: '#E91E63',   // Rosa - Botadero ilegal
    damaged: '#FF9800',       // Naranja - Contenedor dañado
    missed: '#9C27B0',        // Púrpura - Recolección no realizada
  },

  // Colores para estado de puntos
  pointStatus: {
    available: '#4CAF50',     // Verde - Disponible
    full: '#FF6B6B',          // Rojo - Lleno
    maintenance: '#FF9800',   // Naranja - Mantenimiento
    outOfService: '#757575',  // Gris - Fuera de servicio
  },

  // Neutrales
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  disabled: '#BDBDBD',

  // Texto
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Gradientes
  gradients: {
    primary: ['#4CAF50', '#388E3C'],
    secondary: ['#2196F3', '#1565C0'],
    success: ['#66BB6A', '#43A047'],
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;
