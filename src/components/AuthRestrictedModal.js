import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function AuthRestrictedModal({ visible, onClose, onLogin }) {
  // Modal para acciones restringidas a usuarios no autenticados
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Feather name="lock" size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.modalTitle}>Acceso Restringido</Text>
          <Text style={styles.modalMessage}>
            Necesitas estar conectado con tu cuenta para crear o ver tus archivos.
          </Text>

          <TouchableOpacity
            style={styles.modalBtnPrimary}
            onPress={onLogin}
          >
            <Text style={styles.modalBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalBtnSecondary}
            onPress={onClose}
          >
            <Text style={styles.modalBtnTextSecondary}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1e293b', // Puedes usar theme.colors.backgroundSecondary si prefieres
    width: '100%',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },

  modalBtnPrimary: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  modalBtnText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },

  modalBtnSecondary: { paddingVertical: 10 },
  modalBtnTextSecondary: { color: theme.colors.textMuted, fontSize: 14 }
});