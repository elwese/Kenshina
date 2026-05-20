import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function CustomDrawer(props) {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* HEADER DEL DRAWER */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>KENSHINA</Text>
          <TouchableOpacity onPress={() => props.navigation.closeDrawer()} style={styles.closeBtn}>
             <Feather name="x" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ITEMS DEL MENÚ (Calculadora, Wiki) */}
        <View style={styles.menuItems}>
            <DrawerItem 
                label="Creadora" 
                icon="plus-circle" 
                onPress={() => navigation.navigate('CreacionMain')} 
            />
            <DrawerItem 
                label="Wiki" 
                icon="book-open" 
                onPress={() => navigation.navigate('WikiMain')} 
            />
        </View>

      </DrawerContentScrollView>

      {/* FOOTER DEL USUARIO (Fijo abajo) */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.userCard}
            onPress={() => navigation.navigate('AccountMain')}
        >
          <View style={styles.avatarContainer}>
            {user?.imagen_route ? (
                <Image
                    source={{ uri: user.imagen_route }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                />
            ) : (
                <Feather
                    name="user"
                    size={24}
                    color={theme.colors.textSecondary}
                />
            )}

          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>
                {user ? (user?.nombre) : "Invitado"}
            </Text>
            <Text style={styles.userAction}>{user ? "Ver perfil" : "Inicia sesion"}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Componente auxiliar para los botones del menú
const DrawerItem = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
        <Feather name={icon} size={20} color={theme.colors.textSecondary} style={{ marginRight: 15 }} />
        <Text style={styles.drawerLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 10
  },
  logo: { width: 40, height: 40, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.textPrimary },
  closeBtn: { marginLeft: 'auto' },
  
  menuItems: { paddingHorizontal: 10 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  drawerLabel: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: '500' },

  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 20,
    paddingBottom: 30
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  avatarContainer: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  userAction: { color: theme.colors.textMuted, fontSize: 12 }
});