import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  SafeAreaView, Modal, ImageBackground, Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { useUserStats } from '../hooks/useGameData';

export default function AccountMain() {
  const { user, signIn, signUp, signOut } = useAuth();
  
  // --- NUEVO: Traer estadísticas ---
  const navigation = useNavigation();
  
  // Controlamos qué formulario se ve DENTRO del modal
  const [isRegistering, setIsRegistering] = useState(false);
  const { data: stats, isLoading: loadingStats } = useUserStats(user?.id);

  const handlePress = async () => {
        navigation.navigate('HubMain');
    }
  // --- FORMULARIO LOGIN ---
  const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
      setLoading(true);
      try {
        await signIn(email, password);
        // Al loguearse exitosamente, el AuthContext cambia 'user' a true
        // y el Modal se cierra automáticamente por la condición visible={!user}
      } catch (e) {
        Alert.alert('Error al entrar', e.message);
      } finally {
        setLoading(false);
      }
    };
    

    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Bienvenido de nuevo</Text>
        <Text style={styles.modalSubtitle}>Conecta tu correo para ver tus datos</Text>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Correo electrónico" 
            placeholderTextColor={theme.colors.textMuted}
            value={email} onChangeText={setEmail} autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Contraseña" 
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry value={password} onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => setIsRegistering(true)}>
            <Text style={styles.switchLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- FORMULARIO REGISTRO ---
  const RegisterForm = () => {
    const [uidGenshin,setUidGenshin]=useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if(!username || !email || !password) {
            Alert.alert("Faltan datos", "Por favor llena todos los campos");
            return;
        }
        setLoading(true);
        try {
            await signUp(email, password, username, uidGenshin);
            // Si funciona, el modal se cierra solo porque 'user' dejará de ser null
        } catch (e) {
            Alert.alert('Error en registro', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Registra tu cuenta</Text>
        <Text style={styles.modalSubtitle}>Crea tu perfil de Genshin</Text>


        <View style={styles.inputContainer}>
          <Feather name="compass" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="UID del juego" 
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            maxLength={6}
            value={uidGenshin}
            onChangeText={setUidGenshin}
            />
          
        </View>


        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} placeholder="Nombre de Usuario" placeholderTextColor={theme.colors.textMuted}
            value={username} onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} placeholder="Correo electrónico" placeholderTextColor={theme.colors.textMuted}
            value={email} onChangeText={setEmail} autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input} placeholder="Contraseña" placeholderTextColor={theme.colors.textMuted}
            secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none"
          />
        </View>
        
        

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Creando...' : 'Crear Cuenta'}</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => setIsRegistering(false)}>
            <Text style={styles.switchLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- PANTALLA PRINCIPAL (PERFIL) ---
  // Esta se muestra de fondo, o cuando el modal desaparece
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Feather name="menu" size={28} color="white" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Mi Cuenta</Text>
         <View style={{width: 28}} /> 
      </View>

      {/* Contenido del Perfil (Solo visible si hay usuario, pero lo renderizamos siempre de fondo) */}
      {user && (
        <View style={styles.content}>
            <LinearGradient colors={['#4c1d95', '#2e1065']} style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                    <Image
                        source={{
                        uri: user?.imagen_route
                        ? user.imagen_route
                        : 'https://i.ibb.co/ZR1dKGFd/maxresdefault.jpg'
                        }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                    />
                </View>

                <Text style={styles.profileName}>{user?.nombre || "Viajero"}</Text> 
                {/* Aquí deberíamos cargar el nombre real desde la DB usando useQuery en el futuro */}
                
                <Text style={styles.uidText}>UID: {user?.id_usuario_genshin || "No asignado"}</Text>

                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                     <Text style={styles.logoutText}>Cerrar Sesión</Text>
                     <Feather name="log-out" size={18} color="#ef4444" />
                </TouchableOpacity>
            </LinearGradient>
            
           <View style={styles.extraCard}>
            <Text style={styles.statsTitle}>Resumen de Cuenta</Text>
            
            <View style={styles.statsGrid}>
                
                {/* 1. Personajes */}
                <TouchableOpacity style={styles.statItem} onPress={handlePress} activeOpacity={0.7}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(96, 165, 250, 0.2)' }]}>
                        <Feather name="user" size={20} color="#60a5fa" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Personajes</Text>
                        {loadingStats ? <ActivityIndicator size="small" color="white"/> : 
                            <Text style={styles.statValue}>{stats?.totalPersonajes || 0}</Text>
                        }
                    </View>
                </TouchableOpacity>

                {/* 2. Armas */}
                <TouchableOpacity style={styles.statItem} onPress={handlePress} activeOpacity={0.7}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(248, 113, 113, 0.2)' }]}>
                        <Feather name="briefcase" size={20} color="#f87171" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Armas</Text>
                        {loadingStats ? <ActivityIndicator size="small" color="white"/> : 
                            <Text style={styles.statValue}>{stats?.totalArmas || 0}</Text>
                        }
                    </View>
                </TouchableOpacity>

                {/* 3. Artefactos */}
                <TouchableOpacity style={styles.statItem} onPress={handlePress} activeOpacity={0.7}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
                        <Feather name="shield" size={20} color="#fbbf24" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Artefactos</Text>
                        {loadingStats ? <ActivityIndicator size="small" color="white"/> : 
                            <Text style={styles.statValue}>{stats?.totalArtefactos || 0}</Text>
                        }
                    </View>
                </TouchableOpacity>

                {/* 4. Equipos */}
                <TouchableOpacity style={styles.statItem} onPress={handlePress} activeOpacity={0.7}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                        <Feather name="users" size={20} color="#4ade80" />
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Equipos</Text>
                        {loadingStats ? <ActivityIndicator size="small" color="white"/> : 
                            <Text style={styles.statValue}>{stats?.totalEquipos || 0}</Text>
                        }
                    </View>
                </TouchableOpacity>

            </View>
        </View>
        </View>
      )}

      {/* --- MODAL DE LOGIN/REGISTRO --- */}
      {/* Solo visible si NO hay usuario (user === null) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!user} // SI NO HAY USUARIO -> SE MUESTRA EL MODAL
        onRequestClose={() => {
            // Opcional: Impedir cerrar el modal con botón atrás si es obligatorio loguearse
            // navigation.navigate('Home'); 
        }}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                {/* Logo o Imagen pequeña arriba del form */}
                <Image source={require('../../assets/logo.png')} style={styles.modalLogo} resizeMode="contain"/>
                
                {isRegistering ? <RegisterForm /> : <LoginForm />}
                
                {/* Botón para volver al Home si no quiere loguearse ahora (Opcional) */}
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{marginTop: 20}}>
                    <Text style={{color: theme.colors.textMuted, fontSize: 12}}>Volver al Inicio</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 40, marginBottom: 20
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)', // Fondo oscuro casi sólido
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    elevation: 10
  },
  modalLogo: { width: 60, height: 60, marginBottom: 20 },
  modalContent: { width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20 },

  // Inputs
  inputContainer: {
    flexDirection: 'row', backgroundColor: theme.colors.background,
    borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'center', marginBottom: 12, paddingHorizontal: 12
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: 'white', paddingVertical: 12 },

  // Botones
  primaryButton: {
    backgroundColor: theme.colors.primary, paddingVertical: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 10
  },
  primaryButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },

  switchContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  switchText: { color: theme.colors.textSecondary },
  switchLink: { color: theme.colors.primary, fontWeight: 'bold' },

  // Perfil Estilos
  profileCard: { padding: 30, borderRadius: 24, alignItems: 'center', marginBottom: 20 },
  profileAvatar: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 118, 118, 0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileName: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  uidText: { color: '#d8b4fe', marginTop: 4, fontSize: 12 },
  logoutButton: { 
    flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 50, alignItems: 'center', gap: 8
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold' },
  // ... tus estilos anteriores ...

  extraCard: {
    marginTop: 20,
    backgroundColor: '#1e293b', // Fondo oscuro tarjeta principal
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // CLAVE: Permite que bajen a la siguiente línea
    justifyContent: 'space-between', // Separa los items a los extremos
    gap: 10 // Espacio vertical entre filas (si React Native versión nueva) o usa marginBottom en statItem
  },
  statItem: {
    width: '48%', // Casi la mitad para que quepan 2 por fila
    backgroundColor: '#0f172a', // Un poco más oscuro que el fondo
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Espacio inferior si hay muchas filas
    borderWidth: 1,
    borderColor: '#334155'
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});