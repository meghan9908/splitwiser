import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

// Custom color palette based on Material 3
const customColors = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  
  // Custom expense-related colors
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Balance colors
  positive: '#4CAF50', // Green for money owed to user
  negative: '#F44336', // Red for money user owes
  neutral: '#757575',  // Gray for settled/neutral
};

const customFonts = configureFonts({
  config: {
    displayLarge: {
      fontFamily: 'System',
      fontSize: 57,
      fontWeight: '400',
      lineHeight: 64,
      letterSpacing: -0.25,
    },
    displayMedium: {
      fontFamily: 'System',
      fontSize: 45,
      fontWeight: '400',
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: 'System',
      fontSize: 36,
      fontWeight: '400',
      lineHeight: 44,
      letterSpacing: 0,
    },
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 32,
      fontWeight: '400',
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '400',
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '400',
      lineHeight: 32,
      letterSpacing: 0,
    },
    titleLarge: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '400',
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.4,
    },
    labelLarge: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
});

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
  fonts: customFonts,
};

// Dark theme colors
const darkCustomColors = {
  ...customColors,
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  
  outline: '#938F99',
  outlineVariant: '#49454F',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4',
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkCustomColors,
  },
  fonts: customFonts,
};

// Default theme (light)
export const theme = lightTheme;

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  round: 50,
};

// Elevation levels
export const elevation = {
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
};

export default { lightTheme, darkTheme, theme, spacing, borderRadius, elevation };
