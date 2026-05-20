import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// IMPORTANTE: Importamos nuestro tema
import { theme } from '../utils/theme';
import { globalStyles } from '../utils/globalStyles';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const MenuCard = ({ title, subtitle, iconName, color, targetScreen }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate(targetScreen)}
    >
      {/* Usamos opacity en el hex para el fondo del icono */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Feather name={iconName} size={24} color={color} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={24} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.backgroundSecondary]}
      style={globalStyles.container} // Usamos estilo global
    >
      <SafeAreaView style={globalStyles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={globalStyles.title}>K E N S H I N A</Text>
          <Text style={styles.appTagline}>MANAGER & WIKI</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.menuContainer}>
          <MenuCard 
            title="Creacion" 
            subtitle="Crea tus personajes y guardalos en tu cuenta" 
            iconName="plus-circle" 
            color={theme.colors.primary} // Usamos variable
            targetScreen="CreacionMain"
          />
          <MenuCard 
            title="Wiki" 
            subtitle="Consulta información detallada del juego" 
            iconName="book-open" 
            color={theme.colors.secondary} // Usamos variable
            targetScreen="WikiMain"
          />
          <MenuCard 
            title="Cuenta" 
            subtitle="Gestiona tu perfil y datos guardados" 
            iconName="user" 
            color={theme.colors.tertiary} // Usamos variable
            targetScreen="AccountMain"
          />
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.footer}>
          <Text style={styles.versionText}>Versión 1.0.0-beta</Text>
        </TouchableOpacity>

        {/* MODAL (Simplificado visualmente gracias al theme) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Notas de la Versión</Text>
                  <Text style={styles.modalVersion}>v1.0.0-beta</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.changeList}>
                <ChangeItem text="Pantallas de creacion de personajes creada" />
              </View>
              <View style={styles.changeList}>
                <ChangeItem text="Pantalla hub de personajes y equipos creada" />
              </View>
              <View style={styles.changeList}>
                <ChangeItem text="Placeholder en areas por terminar" />
              </View>

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const ChangeItem = ({ text }) => (
  <View style={styles.changeItem}>
    <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
    <Text style={styles.changeText}>{text}</Text>
  </View>
);

// ESTILOS LOCALES (Solo lo específico de esta pantalla)
const styles = StyleSheet.create({
  // ... (Header styles similares, ajustando colores)
  header: { alignItems: 'center', marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl },
  logo: { width: 80, height: 80, marginBottom: theme.spacing.m },
  
  // Fíjate cómo usamos theme.colors en lugar de '#hex'
  appTagline: { 
    fontSize: 12, 
    color: theme.colors.textSecondary, 
    letterSpacing: 3, 
    textTransform: 'uppercase' 
  },
  divider: {
    height: 2,
    width: 40,
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.m,
    borderRadius: 1
  },
  menuContainer: { gap: theme.spacing.m },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 20,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: theme.colors.textSecondary },

  footer: { marginTop: 'auto', alignItems: 'center', paddingBottom: 20 },
  versionText: { color: theme.colors.textMuted, fontSize: 12 },

  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundSecondary,
    width: '100%',
    borderRadius: theme.borderRadius.modal,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.textPrimary },
  modalVersion: { fontSize: 14, color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  
  changeList: { gap: 16, marginBottom: 24 },
  changeItem: { flexDirection: 'row', gap: 12, paddingRight: 10 },
  changeText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20, flex: 1 },

  modalButton: {
    backgroundColor: theme.colors.action,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center'
  },
  modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});