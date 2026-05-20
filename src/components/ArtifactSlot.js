import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { STAT_SCALING, SUBSTAT_OPTIONS } from '../utils/artifactConstants';

export default function ArtifactSlot({ 
  type, // "FLOR", "PLUMA", "RELOJ" en mayusculas
  selectedArtifact, // Objeto {id, nombre_set, imagen, etc}
  onOpenModal, // Función para abrir el modal de selección
  
  // States del padre
  level, setLevel, 
  mainStatType, setMainStatType,
  subStats, setSubStats, // Array de 4 objetos
  mainStatOptions // Opciones para el picker principal
}) {

  // --- Seccion calculo ---
  const calculateMainStatValue = () => {
    if (!mainStatType) return 0;
    
    // Casos especiales FLOR/PLUMA
    if (type === 'FLOR') return Math.round(717 + (parseInt(level || 0) * 203.15));
    if (type === 'PLUMA') return Math.round(47 + (parseInt(level || 0) * 13.2));

    const scaling = STAT_SCALING[mainStatType];
    if (!scaling) return 0;

    let val = scaling.base + (parseInt(level || 0) * scaling.factor);
    return mainStatType.includes('_P') || mainStatType.includes('CRIT') || mainStatType.includes('BONO') || mainStatType.includes('RECARGA') || mainStatType.includes('D_')
      ? val.toFixed(1) + '%' 
      : Math.round(val);
  };

  const handleLevelChange = (text) => {
    let num = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(num)) num = 0;
    if (num > 20) num = 20;
    setLevel(num.toString());
  };

  // --- SUBSTATS ---
  const updateSubStat = (index, field, value) => {
    const newStats = [...subStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setSubStats(newStats);
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER: IMAGEN Y NIVEL */}
      <View style={styles.topRow}>
        <TouchableOpacity 
          style={styles.imageBox} 
          onPress={() => onOpenModal(type)}
        >
          {selectedArtifact && selectedArtifact.imagen_route ? (
             <Image source={{ uri: selectedArtifact.imagen_route }} style={{width:'100%', height:'100%'}} resizeMode="cover"/>
          ) : (
             <Feather name="plus" size={24} color={theme.colors.textMuted} />
          )}
          <View style={styles.typeBadge}><Text style={styles.typeText}>{type}</Text></View>
        </TouchableOpacity>

        <View style={{flex: 1, marginLeft: 15}}>
             {/* NOMBRE SET */}
             <Text style={styles.setName}>
                {selectedArtifact ? selectedArtifact.nombre_set : "Selecciona Set..."}
             </Text>
             
             {/* STAT PRINCIPAL INPUT/DISPLAY */}
             <View style={styles.mainStatRow}>
                {/* SELECTOR DE STAT (Solo si no es Flor o Pluma) */}
                {(type === 'FLOR' || type === 'PLUMA') ? (
                    <Text style={styles.fixedStat}>
                        {type === 'FLOR' ? "VIDA" : "ATAQUE"}
                    </Text>
                ) : (
                    <PickerButton 
                        value={mainStatType} 
                        options={mainStatOptions} 
                        onSelect={setMainStatType}
                        disabled={!selectedArtifact}
                    />
                )}

                <Text style={styles.yellowValue}>{calculateMainStatValue()}</Text>
             </View>

             {/* NIVEL INPUT */}
             <View style={styles.levelContainer}>
                 <Text style={styles.levelLabel}>NV</Text>
                 <TextInput 
                    style={styles.levelInput}
                    value={level.toString()}
                    keyboardType="numeric"
                    onChangeText={handleLevelChange}
                    editable={!!selectedArtifact}
                 />
             </View>
        </View>
      </View>

      {/* SUBSTATS (4 Filas) */}
      <View style={styles.substatsContainer}>
         {subStats.map((stat, index) => (
            <View key={index} style={styles.substatRow}>
                {/* Picker de Substat */}
                <View style={{flex: 1, marginRight: 10}}>
                    <PickerButton 
                        value={stat.bono} 
                        options={SUBSTAT_OPTIONS} 
                        onSelect={(val) => updateSubStat(index, 'bono', val)}
                        placeholder="Sub..."
                        mini
                        disabled={!selectedArtifact}
                    />
                </View>
                
                {/* Input Valor */}
                <View style={styles.plusBox}>
                    <Feather name="plus" size={12} color={theme.colors.textMuted}/>
                </View>
                <TextInput 
                    style={styles.substatInput}
                    placeholder="0"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    maxLength={5}
                    value={stat.valor ? stat.valor.toString() : ''}
                    onChangeText={(t) => {
                        if (/^\d{0,3}(\.\d{0,1})?$/.test(t)) {
                             updateSubStat(index, 'valor', t);
                        }
                    }}
                    editable={!!stat.bono}
                />
            </View>
         ))}
      </View>

    </View>
  );
}

// Pequeño componente auxiliar para simular un Picker/Select bonito
const PickerButton = ({ value, options, onSelect, disabled, placeholder = "Select...", mini }) => {
    const [modalVisible, setModalVisible] = useState(false);
    
    // Buscar label
    const selectedLabel = options?.find(o => o.value === value)?.label || placeholder;

    return (
        <>
        <TouchableOpacity 
            style={[styles.pickerBtn, disabled && {opacity: 0.5}, mini && {paddingVertical: 8}]} 
            onPress={() => !disabled && setModalVisible(true)}
        >
            <Text style={[styles.pickerText, !value && {color:'#64748b'}, mini && {fontSize: 10}]} numberOfLines={1}>
                {selectedLabel}
            </Text>
            {!mini && <Feather name="chevron-down" size={14} color="#64748b" />}
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="fade">
            <View style={styles.pickerOverlay}>
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerTitle}>Seleccionar Atributo</Text><ScrollView style={styles.pickerScroll}>
                        {options?.map(opt => (
                            <TouchableOpacity 
                                key={opt.value} 
                                style={styles.pickerOption}
                                onPress={() => { onSelect(opt.value); setModalVisible(false); }}
                            >
                                <Text style={styles.pickerOptionText}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.pickerCancel} onPress={() => setModalVisible(false)}>
                        <Text style={{color:'#ef4444'}}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        </>
    );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20, backgroundColor: '#0f172a', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  topRow: { flexDirection: 'row', marginBottom: 15 },
  imageBox: { width: 80, height: 80, backgroundColor: '#1e293b', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow:'hidden', borderWidth: 1, borderColor: '#334155' },
  typeBadge: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center' },
  typeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  
  setName: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  
  mainStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  fixedStat: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 12 },
  yellowValue: { color: '#fbbf24', fontWeight: 'bold', fontSize: 18 },

  levelContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  levelLabel: { color: '#64748b', fontSize: 10, marginRight: 5, fontWeight:'bold' },
  levelInput: { backgroundColor: '#1e293b', color: 'white', width: 40, textAlign: 'center', borderRadius: 4, fontWeight: 'bold' },

  substatsContainer: { backgroundColor: '#1e293b', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155' },
  substatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  plusBox: { width: 20, alignItems: 'center' },
  substatInput: { backgroundColor: '#0f172a', color: 'white', width: 60, paddingVertical: 4, textAlign: 'center', borderRadius: 4, fontSize: 12 },

  // Picker Styles
  pickerBtn: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 6, padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { color: 'white', fontSize: 11, fontWeight: '600' },
  
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  pickerContainer: { width: '80%', backgroundColor: '#1e293b', borderRadius: 12, maxHeight: '70%' },
  pickerTitle: { color: 'white', textAlign: 'center', padding: 15, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#334155' },
  pickerOption: { padding: 15, borderBottomWidth: 1, borderColor: '#334155' },
  pickerOptionText: { color: '#cbd5e1', textAlign: 'center' },
  pickerScroll: {
      width: '100%',
      maxHeight: 400, // Opcional: seguridad extra, pero con el maxHeight del container basta
  },
  pickerCancel: { padding: 15, alignItems: 'center' }
});