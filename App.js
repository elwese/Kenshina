import 'react-native-gesture-handler'; // <--- IMPORTANTE: Debe ir en la PRIMERA línea para el Drawer
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// 1. Instancia del cliente para manejar la caché de las peticiones (Wiki, Personajes)
const queryClient = new QueryClient();

export default function App() {
  return (
    // 2. Proveedor de React Query (Para que funcione la API optimizada)
    <QueryClientProvider client={queryClient}>
      
      {/* 3. Proveedor de Autenticación (Para saber si el usuario es Invitado o Viajero) */}
      <AuthProvider>
        
        {/* 4. Proveedor de Área Segura (Para los notches de iPhone/Android) */}
        <SafeAreaProvider>
          
          {/* 5. Tu Navegador Principal (Que ahora contiene el Drawer) */}
          <AppNavigator />
          
          <StatusBar style="light" />
        </SafeAreaProvider>

      </AuthProvider>

    </QueryClientProvider>
  );
}