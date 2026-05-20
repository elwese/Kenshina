import React, { useState } from 'react';
import { View, Text, Modal, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function ArtifactSelectionModal({ visible, onClose, data, onSelect, currentType }) {
  const [search, setSearch] = useState('');

  // Filtrar por TIPO (Flor, Pluma, etc.)
  const filteredTipeData = data.filter(item =>
    (item.tipo ?? "").toLowerCase().includes((currentType ?? "").toLowerCase())
  );

  const filteredData = filteredTipeData.filter(item =>
    (item.nombre_set ?? "").toLowerCase().includes((search ?? "").toLowerCase())
  );


  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Selección de Artefacto</Text>
              <Text style={styles.subtitle}>{currentType}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.searchBar}
            placeholder="Buscar set de artefactos..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList 
            data={filteredData}
            numColumns={2}
            keyExtractor={(item) => item.id_artefacto.toString()}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <View style={[styles.cardBg, { backgroundColor: getRarityColor(item.estrellas_max) }]}> 
                   {item.imagen_route && (
                     <Image source={{ uri: item.imagen_route }} style={styles.cardImage} resizeMode="contain" />
                   )}
                   <Text style={styles.cardText}>{item.nombre_set}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}


const getRarityColor = (stars) => {
  if (stars === 5) return '#d8b4fe'; // Violeta
  if (stars === 4) return '#a78bfa';
  return '#94a3b8';
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  container: { height: '85%', backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  searchBar: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, color: 'white', marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  
  card: { width: '48%', marginBottom: 15 },
  cardBg: { borderRadius: 12, padding: 15, alignItems: 'center', height: 140, justifyContent: 'center' },
  cardImage: { width: 60, height: 60, marginBottom: 10 },
  cardText: { color: '#0f172a', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }
});