import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, FlatList, Alert, Modal, ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { useMisPersonajes, useCrearEquipo } from '../hooks/useGameData';

export default function CreacionEquipo() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // --- HOOKS DE DATOS ---
  // Agregamos isLoading para saber cuándo esperar
  const { data: misPersonajes = [], isLoading, isError, refetch } = useMisPersonajes(user?.id);
  const { mutateAsync: crearEquipoAsync } = useCrearEquipo();

  // --- HELPERS SEGUROS ---
  const getId = (p) => p?.id_personaje;
  const getNombre = (p) => p?.nombre_personalizado || p?.personaje_base?.nombre || "Sin Nombre";
  const getImagen = (p) => p?.personaje_base?.imagen_route;

  // --- DEBUG DE DATOS ---
  useEffect(() => {
    if (isLoading) console.log("⏳ Cargando personajes...");
    else console.log(`✅ Datos cargados: ${misPersonajes.length} personajes encontrados.`);
  }, [isLoading, misPersonajes]);

  // --- ESTADOS ---
  const [nombreEquipo, setNombreEquipo] = useState("Nuevo Equipo");
  const [isEditingName, setIsEditingName] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [slots, setSlots] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); 
  const [tempSelectedChar, setTempSelectedChar] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- RESET AL ENTRAR ---
  useFocusEffect(
    useCallback(() => {
      // Si la lista está vacía al entrar, forzamos una recarga por si acaso
      if(misPersonajes.length === 0) refetch();
      
      setNombreEquipo("Nuevo Equipo");
      setDescripcion("");
      setSlots({ 1: null, 2: null, 3: null, 4: null });
      setHasUnsavedChanges(false);
      setIsSaving(false);
    }, []) // Quitamos dependencias para que solo corra al enfocar
  );

  // Detectar cambios
  useEffect(() => {
    const hasCharacters = Object.values(slots).some(s => s !== null);
    if (hasCharacters || descripcion !== "" || nombreEquipo !== "Nuevo Equipo") {
      setHasUnsavedChanges(true);
    }
  }, [slots, descripcion, nombreEquipo]);

  // --- LÓGICA DE FILTRADO (SOLUCIÓN A TU PROBLEMA) ---
  const personajesParaModal = useMemo(() => {
    // 1. Si está cargando o no hay datos, retornamos vacío
    if (isLoading || !misPersonajes || misPersonajes.length === 0) return [];

    // 2. Identificamos qué IDs ya están en los OTROS slots
    const idsUsados = Object.entries(slots)
      .filter(([pos, char]) => {
        // Ignoramos el slot actual (para permitir cambiar el personaje por otro)
        // e ignoramos los slots vacíos
        return Number(pos) !== activeSlot && char !== null;
      })
      .map(([_, char]) => getId(char));

    // 3. Filtramos: Solo pasan los que NO están en la lista de usados
    const disponibles = misPersonajes.filter(p => {
        const id = getId(p);
        return !idsUsados.includes(id);
    });

    return disponibles;
  }, [misPersonajes, slots, activeSlot, isLoading]);


  // --- HANDLERS ---
  const openSlotModal = (slotNumber) => {
    setActiveSlot(slotNumber);
    setTempSelectedChar(slots[slotNumber]); 
    setModalVisible(true);
  };

  const confirmSelection = () => {
    if (activeSlot) {
        setSlots(prev => ({ ...prev, [activeSlot]: tempSelectedChar }));
    }
    setModalVisible(false);
    setTempSelectedChar(null);
  };

  const handleSaveEquipo = async () => {
    if (!nombreEquipo.trim()) return Alert.alert("Falta Nombre", "Ponle un nombre a tu equipo.");
    
    const miembrosParaGuardar = [];
    Object.keys(slots).forEach(pos => {
        const char = slots[pos];
        if (char) {
            miembrosParaGuardar.push({
                id_personaje_creado: getId(char),
                posicion: parseInt(pos)
            });
        }
    });

    if (miembrosParaGuardar.length === 0) {
        return Alert.alert("Equipo vacío", "Selecciona al menos 1 personaje.");
    }

    setIsSaving(true);
    try {
        await crearEquipoAsync({
            equipoData: {
                id_usuario: user.id,
                nombre: nombreEquipo,
                descripcion: descripcion
            },
            miembros: miembrosParaGuardar 
        });

        Alert.alert("¡Éxito!", "Equipo creado correctamente.");
        setHasUnsavedChanges(false);
        navigation.navigate('HubMain'); 
    } catch (error) {
        console.error("ERROR GUARDANDO:", error);
        Alert.alert("Error", "No se pudo guardar el equipo.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- RENDER ---
  
  // 1. PANTALLA DE CARGA (Para evitar el error "0 de 0")
  if (isLoading) {
    return (
        <SafeAreaView style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{color:'white', marginTop:10}}>Cargando tus personajes...</Text>
        </SafeAreaView>
    );
  }

  // 2. PANTALLA PRINCIPAL
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{padding:5}}>
            <Feather name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creador de Equipos</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* NOMBRE */}
        <View style={styles.nameContainer}>
            {isEditingName ? (
                <View style={styles.editNameRow}>
                    <TextInput 
                        style={styles.nameInput}
                        value={nombreEquipo} onChangeText={setNombreEquipo}
                        autoFocus onBlur={() => setIsEditingName(false)} maxLength={30}
                    />
                    <TouchableOpacity onPress={() => setIsEditingName(false)}>
                        <Feather name="check" size={24} color={theme.colors.success} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.nameDisplayRow} onPress={() => setIsEditingName(true)}>
                    <Text style={styles.teamNameText}>{nombreEquipo}</Text>
                    <Feather name="edit-2" size={18} color={theme.colors.primary} style={{marginLeft: 10}}/>
                </TouchableOpacity>
            )}
        </View>

        {/* SLOTS */}
        <View style={styles.slotsContainer}>
            {[1, 2, 3, 4].map((pos) => {
                const char = slots[pos];
                return (
                    <TouchableOpacity 
                        key={pos}
                        style={[styles.slotCircle, char && styles.slotFilled]}
                        onPress={() => openSlotModal(pos)}
                    >
                        {char ? (
                            <Image source={{ uri: getImagen(char) }} style={styles.slotImage} />
                        ) : (
                            <Feather name="plus" size={24} color="#475569" />
                        )}
                        <View style={styles.posBadge}>
                            <Text style={styles.posText}>{pos}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>

        <Text style={styles.hintText}>Toca un círculo (+) para asignar un personaje</Text>

        {/* DESCRIPCION */}
        <View style={styles.descContainer}>
            <Text style={styles.label}>DESCRIPCIÓN</Text>
            <TextInput 
                style={styles.textArea}
                placeholder="Describe la estrategia..."
                placeholderTextColor={theme.colors.textMuted}
                multiline numberOfLines={3} maxLength={255}
                value={descripcion} onChangeText={setDescripcion}
            />
            <Text style={styles.charCount}>{descripcion.length}/255</Text>
        </View>

        {/* BOTON GUARDAR */}
        <TouchableOpacity 
            style={[styles.saveButton, isSaving && {opacity: 0.7}]} 
            onPress={handleSaveEquipo}
            disabled={isSaving}
        >
            {isSaving ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.saveButtonText}>Crear Equipo</Text>}
        </TouchableOpacity>

      </ScrollView>

      {/* --- MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Seleccionar Posición {activeSlot}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Feather name="x" size={24} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {personajesParaModal.length === 0 ? (
                    <View style={styles.emptyList}>
                        <Text style={{color:'#64748b', textAlign:'center'}}>
                            {misPersonajes.length === 0 
                                ? "No tienes personajes creados.\nVe a 'Crear Personaje' primero." 
                                : "Todos tus personajes ya están en el equipo."}
                        </Text>
                    </View>
                ) : (
                    <FlatList 
                        data={personajesParaModal}
                        keyExtractor={item => getId(item).toString()}
                        numColumns={3}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => {
                            const isSelected = getId(tempSelectedChar) === getId(item);
                            return (
                                <TouchableOpacity 
                                    style={[styles.modalCard, isSelected && styles.modalCardSelected]}
                                    onPress={() => setTempSelectedChar(item)}
                                >
                                    <Image source={{ uri: getImagen(item) }} style={styles.modalCardImage} />
                                    <Text style={styles.modalCardName} numberOfLines={1}>{getNombre(item)}</Text>
                                    {isSelected && (
                                        <View style={styles.checkIcon}>
                                            <Feather name="check-circle" size={16} color={theme.colors.success} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}

                <View style={styles.modalFooter}>
                    <TouchableOpacity 
                        style={styles.removeBtn} 
                        onPress={() => { setTempSelectedChar(null); confirmSelection(); }}
                    >
                        <Text style={{color:'#ef4444', fontWeight:'bold'}}>Quitar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.confirmBtn, !tempSelectedChar && {opacity:0.5}]} 
                        onPress={confirmSelection}
                        disabled={!tempSelectedChar}
                    >
                        <Text style={{color:'#0f172a', fontWeight:'bold'}}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 10, backgroundColor: '#0f172a' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  nameContainer: { marginBottom: 30, alignItems: 'center' },
  nameDisplayRow: { flexDirection: 'row', alignItems: 'center' },
  teamNameText: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  editNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nameInput: { borderBottomWidth: 1, borderBottomColor: theme.colors.primary, color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', minWidth: 200, marginRight: 10 },
  slotsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  slotCircle: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#1e293b', borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  slotFilled: { borderColor: theme.colors.success },
  slotImage: { width: '100%', height: '100%', borderRadius: 37.5 },
  posBadge: { position: 'absolute', bottom: -5, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  posText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  hintText: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, marginBottom: 30 },
  descContainer: { marginBottom: 20 },
  label: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  textArea: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, color: 'white', borderWidth: 1, borderColor: '#334155', textAlignVertical: 'top' },
  charCount: { color: '#475569', fontSize: 10, textAlign: 'right', marginTop: 5 },
  saveButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 5 },
  saveButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { height: '70%', backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalCard: { width: '31%', backgroundColor: '#1e293b', borderRadius: 8, padding: 8, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  modalCardSelected: { borderColor: theme.colors.success, backgroundColor: '#064e3b' },
  modalCardImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 5 },
  modalCardName: { color: 'white', fontSize: 10, textAlign: 'center' },
  checkIcon: { position: 'absolute', top: 5, right: 5 },
  emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalFooter: { flexDirection: 'row', marginTop: 10, borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 10 },
  removeBtn: { flex: 1, alignItems: 'center', padding: 15 },
  confirmBtn: { flex: 2, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center', padding: 15 },
});