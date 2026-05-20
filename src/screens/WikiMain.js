import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../utils/theme'; // Asegúrate de que la ruta sea correcta

export default function WikiMain() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      
    {/* HEADER */}
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{padding: 5}}>
            <Feather name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wiki</Text>
        <View style={{width: 28}} /> 
    </View>

    {/* CONTENIDO CENTRAL */}
    <View style={styles.content}>
    
        <View style={styles.iconCircle}>
            <Image 
                source={require('../../assets/no_hay.png')} 
                style={styles.logo}         
                resizeMode="contain"
            />
        </View>

        <Text style={styles.wipTitle}>Trabajo en proceso</Text>
        
        <Text style={styles.wipText}>
            Próximamente podrás consultar estadísticas base, escalados y lore de todos los personajes y mecanicas del juego.
        </Text>

        <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
        >
            <Text style={styles.buttonText}>Volver al Inicio</Text>
        </TouchableOpacity>

    </View>

</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' 
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 40, 
    paddingBottom: 15,
    backgroundColor: '#0f172a'
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#334155',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  
  logo: { width: 80, 
    height: 80, 
    marginRight: 10 },
  wipTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  wipText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#334155'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});