// src/utils/theme.js

export const theme = {
  colors: {
    // Fondos
    background: '#0f172a',      // El azul muy oscuro del fondo
    backgroundSecondary: '#1e293b', // El color de las tarjetas/modales
    overlay: 'rgba(0,0,0,0.7)', // Para el fondo del modal

    // Textos
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',

    // Acentos (Colores de botones e iconos)
    primary: '#fbbf24',    // Dorado (Genshin)
    secondary: '#38bdf8',  // Azul Wiki
    tertiary: '#a78bfa',   // Violeta Cuenta
    success: '#22c55e',    // Verde Check
    action: '#d97706',     // Naranja Botón Modal
    
    // Bordes
    border: '#334155',
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40
  },
  borderRadius: {
    card: 16,
    modal: 20,
    button: 12
  }
};