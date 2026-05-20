import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

// 1. IMPORTAMOS EL COMPONENTE REUTILIZABLE
import AuthRestrictedModal from '../components/AuthRestrictedModal';

export default function CreacionMain() {
  const navigation = useNavigation();
  const { user } = useAuth(); 
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePress = (targetScreen) => {
    if (user) {
      navigation.navigate(targetScreen);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.openDrawer()} // <--- CAMBIO CLAVE: Abre el Drawer
        >
          {/* CAMBIO VISUAL: Icono de hamburguesa "menu" en lugar de "arrow-left" */}
          <Feather name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creadora</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* BANNER PRINCIPAL */}
        <View style={styles.banner}>
           <View>
             <Image source={require('../../assets/logo.png')} style={styles.bannerLogo} resizeMode="contain"/>
           </View>
           <View style={{marginLeft: 15, flex: 1}}>
             <Text style={styles.bannerTitle}>Creadora</Text>
             <Text style={styles.bannerSubtitle}>I r m i n s u l</Text>
             <View style={styles.bannerRow}>
                <Text style={styles.bannerNumber}>3 0 0 0</Text>
                <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>VER. 1.0</Text>
                </View>
             </View>
           </View>
        </View>

        {/* SECCIÓN 1 */}
        <Text style={styles.sectionTitle}>ZONA DE CREACIÓN</Text>
        
        <TouchableOpacity style={styles.bigCard} onPress={() => handlePress('CreacionPersonaje')}>
          <View style={styles.iconCircle}>
            <Feather name="user" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.bigCardTitle}>Crear Personaje</Text>
          <Text style={styles.bigCardSubtitle}>Nueva build individual</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigCard} onPress={() => handlePress('CreacionEquipo')}>
          <View style={[styles.iconCircle, { borderColor: theme.colors.success }]}>
            <Feather name="users" size={24} color={theme.colors.success} />
          </View>
          <Text style={styles.bigCardTitle}>Crear Equipo</Text>
          <Text style={styles.bigCardSubtitle}>Sinergia de 4 que tengas guardados</Text>
        </TouchableOpacity>

        {/* SECCIÓN 2 */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>ARCHIVOS GUARDADOS</Text>

        <TouchableOpacity style={styles.listCard} onPress={() => handlePress('HubMain')}>
            <View style={styles.listIconContainer}>
                <Feather name="folder" size={20} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.listText}>Personajes Guardados</Text>
            <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.listCard} onPress={() => handlePress('HubMain')}>
            <View style={styles.listIconContainer}>
                <Feather name="users" size={20} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.listText}>Equipos guardados</Text>
            <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

      </ScrollView>

      {/* 2. USAMOS EL COMPONENTE REUTILIZABLE AQUÍ */}
      <AuthRestrictedModal 
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
            setShowAuthModal(false);
            navigation.navigate('AccountMain');
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 40, marginBottom: 10
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  backButton: { padding: 5 },
  content: { padding: 20 },
  
  // Banner
  banner: {
    backgroundColor: '#1e293b', borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: theme.colors.border
  },
  bannerLogo: { width: 60, height: 60 },
  bannerTitle: { color: theme.colors.primary, fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' },
  bannerSubtitle: { color: theme.colors.primary, fontSize: 24, fontWeight: '900', fontStyle: 'italic', lineHeight: 26 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  bannerNumber: { color: 'white', fontSize: 24, fontWeight: 'bold', marginRight: 10 },
  versionBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  versionText: { color: '#0f172a', fontWeight: 'bold', fontSize: 10 },

  // Sections
  sectionTitle: { 
    color: theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold', 
    marginBottom: 15, borderLeftWidth: 3, borderLeftColor: theme.colors.primary, paddingLeft: 10 
  },

  // Big Cards
  bigCard: {
    backgroundColor: theme.colors.backgroundSecondary, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border
  },
  iconCircle: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.2)'
  },
  bigCardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bigCardSubtitle: { color: theme.colors.textMuted, fontSize: 12 },

  // List Cards
  listCard: {
    backgroundColor: theme.colors.backgroundSecondary, borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border
  },
  listIconContainer: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  listText: { color: 'white', fontSize: 14, fontWeight: '600', flex: 1 },
  
  // ¡NOTA!: Ya no necesitamos los estilos del Modal aquí porque están en AuthRestrictedModal.js
});