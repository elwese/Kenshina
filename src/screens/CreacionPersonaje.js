import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Modal, FlatList, Alert, ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Importante para el reset al entrar
import { theme } from '../utils/theme';
import { getElementColor } from '../utils/elementColors';

// Constantes artefactos
import { MAIN_STAT_OPTIONS, STAT_SCALING } from '../utils/artifactConstants'; 

// Componentes
import StarRatingSelector from '../components/StarRatingSelector';
import ArtifactSlot from '../components/ArtifactSlot'; 
import ArtifactSelectionModal from '../components/ArtifactSelectionModal'; 

// Hooks de datos 
import { 
  usePersonajesBase, useArmasBase, useArtefactosBase, 
  useCrearPersonaje, useCrearArma, useCrearArtefacto 
} from '../hooks/useGameData.js';
import { useAuth } from '../context/AuthContext';

export default function CreacionPersonaje() {

  const navigation = useNavigation();
  const { user } = useAuth();

  // --- MUTACIONES (Escritura en DB) ---
  const { mutateAsync: crearPersonajeAsync } = useCrearPersonaje();
  const { mutateAsync: crearArmaAsync } = useCrearArma();
  const { mutateAsync: crearArtefactoAsync } = useCrearArtefacto();

  // --- DATOS DE LA BASE DE DATOS (Lectura) ---
  const { data: personajesLista = [] } = usePersonajesBase();
  const { data: armasLista = [] } = useArmasBase(); 
  const { data: listaArtefactos = [] } = useArtefactosBase();

  // Estado de carga global para el botón guardar
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- ESTADO: MÓDULO PERSONAJE ---
  const [PersonajeSeleccionado, setPersonajeSeleccionado] = useState({ nombre: '', imagen_route: null });
  const [NivelPersonaje, setNivelPersonaje] = useState("1");
  const [ConstelacionPersonaje, setConstelacionPersonaje] = useState(0);
  
  // --- ESTADO: MÓDULO ARMA ---
  const [ArmaSeleccionada, setArmaSeleccionada] = useState({ nombre: '', imagen_route: null });
  const [NivelArma, setNivelArma] = useState("1");
  const [RefinamientoArma, setRefinamientoArma] = useState(1);

  // --- ESTADO: MÓDULO TALENTOS ---
  const [NivelBasicos, setNivelBasicos] = useState(1);
  const [NivelElemental, setNivelElemental] = useState(1);
  const [NivelDefinitiva, setNivelDefinitiva] = useState(1);

  // --- ESTADOS: ARTEFACTOS ---
  const [modalArtifactVisible, setModalArtifactVisible] = useState(false);
  const [activeArtifactType, setActiveArtifactType] = useState(null);

  // Definimos estados iniciales para resetear fácil
  const initialArtifactState = { selected: null, level: "0", mainStat: "", subStats: [{},{},{},{}] };

  // 1. FLOR
  const [FlorSeleccionada, setFlorSeleccionada] = useState(null);
  const [FlorNivel, setFlorNivel] = useState("0");
  const [FlorMainStat, setFlorMainStat] = useState("VIDA");
  const [FlorSubStats, setFlorSubStats] = useState([{},{},{},{}]);

  // 2. PLUMA
  const [PlumaSeleccionada, setPlumaSeleccionada] = useState(null);
  const [PlumaNivel, setPlumaNivel] = useState("0");
  const [PlumaMainStat, setPlumaMainStat] = useState("ATQ");
  const [PlumaSubStats, setPlumaSubStats] = useState([{},{},{},{}]);

  // 3. RELOJ
  const [RelojSeleccionado, setRelojSeleccionado] = useState(null);
  const [RelojNivel, setRelojNivel] = useState("0");
  const [RelojMainStat, setRelojMainStat] = useState(""); 
  const [RelojSubStats, setRelojSubStats] = useState([{},{},{},{}]);

  // 4. COPA (Caliz)
  const [CopaSeleccionado, setCopaSeleccionado] = useState(null);
  const [CopaNivel, setCopaNivel] = useState("0");
  const [CopaMainStat, setCopaMainStat] = useState(""); 
  const [CopaSubStats, setCopaSubStats] = useState([{},{},{},{}]);

  // 5. TIARA (Corona)
  const [TiaraSeleccionada, setTiaraSeleccionada] = useState(null);
  const [TiaraNivel, setTiaraNivel] = useState("0");
  const [TiaraMainStat, setTiaraMainStat] = useState(""); 
  const [TiaraSubStats, setTiaraSubStats] = useState([{},{},{},{}]);

  // --- CONTROL UI ---
  const [modalPersonajeVisible, setModalPersonajeVisible] = useState(false);
  const [modalArmaVisible, setModalArmaVisible] = useState(false);

  // --- RESET LOGIC (Cuando entra a la pantalla) ---
  const resetForm = useCallback(() => {
    setPersonajeSeleccionado({ nombre: '', imagen_route: null });
    setNivelPersonaje("1");
    setConstelacionPersonaje(0);
    
    setArmaSeleccionada({ nombre: '', imagen_route: null });
    setNivelArma("1");
    setRefinamientoArma(1);

    setNivelBasicos(1);
    setNivelElemental(1);
    setNivelDefinitiva(1);

    // Reset Artefactos
    setFlorSeleccionada(null); setFlorNivel("0"); setFlorSubStats([{},{},{},{}]);
    setPlumaSeleccionada(null); setPlumaNivel("0"); setPlumaSubStats([{},{},{},{}]);
    setRelojSeleccionado(null); setRelojNivel("0"); setRelojMainStat(""); setRelojSubStats([{},{},{},{}]);
    setCopaSeleccionado(null); setCopaNivel("0"); setCopaMainStat(""); setCopaSubStats([{},{},{},{}]);
    setTiaraSeleccionada(null); setTiaraNivel("0"); setTiaraMainStat(""); setTiaraSubStats([{},{},{},{}]);

    setHasUnsavedChanges(false);
  }, []);

  // Hook para detectar si entra a la pantalla y limpiar datos antiguos
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [resetForm])
  );

  // Hook para detectar cambios y activar la protección de salida
  useEffect(() => {
    if (PersonajeSeleccionado.id_personaje) {
      setHasUnsavedChanges(true);
    }
  }, [PersonajeSeleccionado, ArmaSeleccionada]); // Puedes agregar más dependencias

  // --- PROTECCIÓN DE NAVEGACIÓN (Salir sin guardar) ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        // Si no hay cambios, dejar salir
        return;
      }

      // Prevenir navegación por defecto
      e.preventDefault();

      // Mostrar alerta
      Alert.alert(
        '¿Descartar cambios?',
        'Tienes un personaje a medio crear. Si sales ahora, perderás los datos.',
        [
          { text: 'Quedarse', style: 'cancel', onPress: () => {} },
          {
            text: 'Descartar y Salir',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);


  // --- HANDLERS SELECCIÓN ---
  const handleArtifactSelect = (item) => {
     if (activeArtifactType === 'FLOR') setFlorSeleccionada(item);
     if (activeArtifactType === 'PLUMA') setPlumaSeleccionada(item);
     if (activeArtifactType === 'RELOJ') setRelojSeleccionado(item);
     if (activeArtifactType === 'COPA') setCopaSeleccionado(item);
     if (activeArtifactType === 'TIARA') setTiaraSeleccionada(item);
  };

  const openArtifactModal = (type) => {
      setActiveArtifactType(type);
      setModalArtifactVisible(true);
  };

  // --- LÓGICA DE VALIDACIÓN Y GUARDADO ---
  
  // Helper para calcular valor principal numérico para guardar en DB
  const calculateMainValue = (type, statType, level) => {
     // Lógica duplicada de ArtifactSlot pero necesaria para enviar el número crudo a la DB
     if (type === 'FLOR') return Math.round(717 + (parseInt(level || 0) * 203.15));
     if (type === 'PLUMA') return Math.round(47 + (parseInt(level || 0) * 13.2));
     const scaling = STAT_SCALING[statType];
     if (!scaling) return 0;
     return scaling.base + (parseInt(level || 0) * scaling.factor);
  };

  const handleSaveCharacter = async () => {
    // 1. VALIDACIONES
    if (!PersonajeSeleccionado.id_personaje) return Alert.alert("Falta información", "Debes seleccionar un personaje base.");
    if (!ArmaSeleccionada.id_arma) return Alert.alert("Falta información", "Debes seleccionar un arma.");
    
    // Validar artefactos obligatorios (Los 5)
    if (!FlorSeleccionada || !PlumaSeleccionada || !RelojSeleccionado || !CopaSeleccionado || !TiaraSeleccionada) {
        return Alert.alert("Artefactos incompletos", "Debes equipar los 5 artefactos (Flor, Pluma, Reloj, Copa, Tiara).");
    }
    // Validar Stats principales
    if (!RelojMainStat || !CopaMainStat || !TiaraMainStat) {
        return Alert.alert("Stats incompletos", "Asegúrate de seleccionar el Stat Principal en Reloj, Copa y Tiara.");
    }

    // Confirmación
    Alert.alert(
        "Guardar Personaje",
        "¿Estás seguro de que quieres guardar esta build en Irminsul?",
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Guardar", onPress: executeSave }
        ]
    );
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
        // A. CREAR PERSONAJE (Tabla Padre)
        const charData = {
            id_personaje_base: PersonajeSeleccionado.id_personaje,
            id_usuario: user.id, // AuthContext UUID
            nivel: parseInt(NivelPersonaje),
            constelacion: ConstelacionPersonaje,
            talento_basico: NivelBasicos,
            talento_elemental: NivelElemental,
            talento_ult: NivelDefinitiva
        };

        const nuevoPersonaje = await crearPersonajeAsync(charData);
        if (!nuevoPersonaje || !nuevoPersonaje.id_personaje) throw new Error("Error al obtener ID del personaje creado.");
        
        const charId = nuevoPersonaje.id_personaje;

        // B. CREAR ARMA
        const armaData = {
            id_arma_base: ArmaSeleccionada.id_arma,
            id_usuario: user.id,
            id_personaje_equipado: charId, // FK IMPORTANTE
            nivel: parseInt(NivelArma),
            refinamiento: RefinamientoArma
        };
        await crearArmaAsync(armaData);

        // C. CREAR ARTEFACTOS (Loop)
        // Preparamos el array de artefactos para iterar
        const artifactsToSave = [
            { 
                type: 'FLOR', base: FlorSeleccionada, lvl: FlorNivel, main: FlorMainStat, subs: FlorSubStats 
            },
            { 
                type: 'PLUMA', base: PlumaSeleccionada, lvl: PlumaNivel, main: PlumaMainStat, subs: PlumaSubStats 
            },
            { 
                type: 'RELOJ', base: RelojSeleccionado, lvl: RelojNivel, main: RelojMainStat, subs: RelojSubStats 
            },
            { 
                type: 'COPA', base: CopaSeleccionado, lvl: CopaNivel, main: CopaMainStat, subs: CopaSubStats 
            },
            { 
                type: 'TIARA', base: TiaraSeleccionada, lvl: TiaraNivel, main: TiaraMainStat, subs: TiaraSubStats 
            },
        ];

        // Usamos un loop secuencial para asegurar orden y manejo de errores
        for (const art of artifactsToSave) {
            // Filtrar substats vacíos (que tengan bono y valor)
            const validSubstats = art.subs
                .filter(s => s.bono && s.valor)
                .map(s => ({
                    bono: s.bono,
                    valor: parseFloat(s.valor) // Asegurar que sea float8 para la DB
                }));

            const artifactPayload = {
                artefactoData: {
                    id_artefacto_base: art.base.id_artefacto,
                    id_usuario: user.id,
                    id_personaje_equipado: charId, // FK IMPORTANTE
                    nivel: parseInt(art.lvl),
                    stat_principal: art.main,
                    valor_principal: calculateMainValue(art.type, art.main, art.lvl)
                },
                substatsData: validSubstats // Nuestra API service maneja la creación de hijos
            };

            await crearArtefactoAsync(artifactPayload);
        }

        // D. FINALIZAR
        Alert.alert("¡Éxito!", "Personaje guardado correctamente en tu Hub.");
        setHasUnsavedChanges(false); // Desactivar protección para poder salir
        resetForm(); // Limpiar formulario
        navigation.navigate('HubMain'); // Ir a la lista

    } catch (error) {
        console.error(error);
        Alert.alert("Error al guardar", error.message || "Ocurrió un error inesperado.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- HELPERS UI ---
  const dynamicColor = PersonajeSeleccionado?.elemento 
    ? getElementColor(PersonajeSeleccionado.elemento) 
    : theme.colors.primary;

  const armasFiltradas = useMemo(() => {
    if (!PersonajeSeleccionado?.arma) return [];
    return armasLista.filter(a => a.tipo === PersonajeSeleccionado.arma);
  }, [PersonajeSeleccionado, armasLista]);

  // Resetear arma si cambia el personaje
  useEffect(() => {
    // Solo si ya hay un arma seleccionada que no coincide
    if (PersonajeSeleccionado.arma && ArmaSeleccionada.nombre) {
        // Aquí podrías validar si el arma actual coincide con el tipo, si no, resetear.
        // Por simplicidad, reseteamos si cambia el personaje.
        setArmaSeleccionada({ nombre: '', imagen_route: null });
    }
  }, [PersonajeSeleccionado.id_personaje]);


  // ... Handlers de Nivel y Modales (igual que antes) ...
  const handleLevelChange = (text, setter) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  const validateLevelBlur = (value, setter) => {
    let num = parseInt(value);
    if (isNaN(num) || num < 1) setter("1");
    else if (num > 90) setter("90");
    else setter(num.toString());
  };

  const SelectionModal = ({ visible, onClose, data, onSelect, title }) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="white"/></TouchableOpacity>
          </View>
          <FlatList 
            data={data}
            keyExtractor={(item) => item.id_personaje?.toString() || item.id_arma?.toString() || Math.random().toString()} 
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={styles.modalItemText}>{item.nombre}</Text>
                {item.estrellas && <Text style={{color: '#fbbf24'}}>{item.estrellas}★</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("CreacionMain")} style={{padding:5}}>
            <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Personaje</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* MODULO 1: PERSONAJE */}
        <Text style={[styles.sectionLabel, {color: dynamicColor}]}>
           <Feather name="user" /> PERSONAJE
        </Text>
        
        <View style={styles.rowContainer}>
            <View style={{flex: 1, marginRight: 15}}>
                <Text style={styles.label}>SELECCIÓN</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalPersonajeVisible(true)}>
                    <Feather name="search" size={16} color={theme.colors.textMuted} />
                    <Text style={[styles.dropdownText, !PersonajeSeleccionado.nombre && {color: theme.colors.textMuted}]}>
                        {PersonajeSeleccionado.nombre || "Buscar..."}
                    </Text>
                    <Feather name="chevron-down" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.levelRow}>
                    <TextInput 
                        style={[styles.levelInput, {borderBottomColor: dynamicColor}]}
                        value={NivelPersonaje} keyboardType="numeric"
                        onChangeText={(t) => handleLevelChange(t, setNivelPersonaje)}
                        onBlur={() => validateLevelBlur(NivelPersonaje, setNivelPersonaje)}
                    />
                    <Text style={styles.levelMaxText}>/ 90</Text>
                    <TouchableOpacity style={styles.maxButton} onPress={() => setNivelPersonaje("90")}>
                        <Text style={styles.maxButtonText}>Max</Text>
                    </TouchableOpacity>
                </View>

                <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 15, marginBottom: 5}}>
                    <Text style={styles.label}>CONSTELACIÓN</Text>
                    <Text style={[styles.valueBadge, {color: dynamicColor}]}>C{ConstelacionPersonaje}</Text>
                </View>
                <StarRatingSelector 
                    max={6} value={ConstelacionPersonaje} onChange={setConstelacionPersonaje} activeColor={dynamicColor} 
                />
            </View>

            <View style={styles.imageCard}>
                {PersonajeSeleccionado.imagen_route ? (
                    <Image source={{ uri: PersonajeSeleccionado.imagen_route }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <Feather name="user" size={40} color={theme.colors.border} />
                )}
            </View>
        </View>

        <View style={styles.divider} />

        {/* MODULO 2: ARMA */}
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
             <View style={{flex:1}} /> 
             <Text style={[styles.sectionLabel, {color: theme.colors.primary}]}>
                ARMA <Feather name="tool" /> 
            </Text>
        </View>

        <View style={styles.rowContainer}>
             <View style={[styles.imageCard, {marginRight: 15}]}>
                {ArmaSeleccionada.imagen_route ? (
                    <Image source={{ uri: ArmaSeleccionada.imagen_route }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <Feather name="tool" size={40} color={theme.colors.border} />
                )}
            </View>

            <View style={{flex: 1}}>
                <Text style={styles.label}>SELECCIÓN</Text>
                <TouchableOpacity 
                    style={[styles.dropdownButton, !PersonajeSeleccionado.nombre && {opacity: 0.5}]}
                    onPress={() => { if(PersonajeSeleccionado.nombre) setModalArmaVisible(true); }}
                    disabled={!PersonajeSeleccionado.nombre}
                >
                    <Feather name="search" size={16} color={theme.colors.textMuted} />
                    <Text style={[styles.dropdownText, !ArmaSeleccionada.nombre && {color: theme.colors.textMuted}]}>
                        {ArmaSeleccionada.nombre || "Buscar..."}
                    </Text>
                    {!PersonajeSeleccionado.nombre && <Feather name="lock" size={14} color={theme.colors.textMuted}/>}
                </TouchableOpacity>

                <View style={styles.levelRow}>
                    <TextInput 
                        style={[styles.levelInput, {borderBottomColor: theme.colors.primary}]}
                        value={NivelArma} keyboardType="numeric"
                        onChangeText={(t) => handleLevelChange(t, setNivelArma)}
                        onBlur={() => validateLevelBlur(NivelArma, setNivelArma)}
                    />
                    <Text style={styles.levelMaxText}>/ 90</Text>
                    <TouchableOpacity style={styles.maxButton} onPress={() => setNivelArma("90")}>
                        <Text style={styles.maxButtonText}>Max</Text>
                    </TouchableOpacity>
                </View>

                <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 15, marginBottom: 5}}>
                    <Text style={styles.label}>REFINAMIENTO</Text>
                    <View style={{backgroundColor:'#334155', borderRadius:4, paddingHorizontal:6}}>
                        <Text style={[styles.valueBadge, {color: '#ef4444'}]}>R{RefinamientoArma}</Text>
                    </View>
                </View>
                <StarRatingSelector 
                    max={5} value={RefinamientoArma} onChange={setRefinamientoArma} activeColor={'#ef4444'} 
                />
            </View>
        </View>

        <View style={styles.divider} />

        {/* MODULO 3: TALENTOS */}
        <Text style={[styles.sectionLabel, {color: '#fbbf24'}]}><Feather name="zap" /> TALENTOS</Text>

        <View style={styles.talentsContainer}>
            <Text style={[styles.sectionLabel, {color: '#5dd1f5ff'}]}>Ataques Básicos</Text>
            <View style={styles.talentRow}>
                <Feather name="hexagon" size={18} color="#94a3b8" style={{width: 30}} />
                <View style={{flex:1}}>
                    <StarRatingSelector max={10} value={NivelBasicos} onChange={setNivelBasicos} activeColor="#60a5fa" />
                </View>
            </View>

            <Text style={[styles.sectionLabel, {color: '#9d8ff7ff'}]}>Habilidad Elemental</Text>
            <View style={styles.talentRow}>
                <Feather name="zap" size={18} color="#94a3b8" style={{width: 30}} />
                <View style={{flex:1}}>
                    <StarRatingSelector max={10} value={NivelElemental} onChange={setNivelElemental} activeColor="#c084fc" />
                </View>
            </View>

             <Text style={[styles.sectionLabel, {color: '#8eb900ff'}]}>Habilidad Definitiva</Text>
             <View style={styles.talentRow}>
                <Feather name="star" size={18} color="#94a3b8" style={{width: 30}} />
                <View style={{flex:1}}>
                    <StarRatingSelector max={10} value={NivelDefinitiva} onChange={setNivelDefinitiva} activeColor="#fbbf24" />
                </View>
            </View>
        </View>

        <View style={styles.divider} />

        {/* MODULO 4: ARTEFACTOS */}
        <Text style={[styles.sectionLabel, {color: '#fbbf24'}]}><Feather name="shield" /> ARTEFACTOS</Text>

        <ArtifactSlot 
            type="FLOR" selectedArtifact={FlorSeleccionada} onOpenModal={openArtifactModal}
            level={FlorNivel} setLevel={setFlorNivel}
            mainStatType={FlorMainStat} setMainStatType={setFlorMainStat}
            subStats={FlorSubStats} setSubStats={setFlorSubStats}
        />
        <ArtifactSlot 
            type="PLUMA" selectedArtifact={PlumaSeleccionada} onOpenModal={openArtifactModal}
            level={PlumaNivel} setLevel={setPlumaNivel}
            mainStatType={PlumaMainStat} setMainStatType={setPlumaMainStat}
            subStats={PlumaSubStats} setSubStats={setPlumaSubStats}
        />
        <ArtifactSlot 
            type="RELOJ" selectedArtifact={RelojSeleccionado} onOpenModal={openArtifactModal}
            level={RelojNivel} setLevel={setRelojNivel}
            mainStatType={RelojMainStat} setMainStatType={setRelojMainStat}
            subStats={RelojSubStats} setSubStats={setRelojSubStats}
            mainStatOptions={MAIN_STAT_OPTIONS.RELOJ}
        />
        <ArtifactSlot 
            type="COPA" selectedArtifact={CopaSeleccionado} onOpenModal={openArtifactModal}
            level={CopaNivel} setLevel={setCopaNivel}
            mainStatType={CopaMainStat} setMainStatType={setCopaMainStat}
            subStats={CopaSubStats} setSubStats={setCopaSubStats}
            mainStatOptions={MAIN_STAT_OPTIONS.COPA} 
        />
        <ArtifactSlot 
            type="TIARA" selectedArtifact={TiaraSeleccionada} onOpenModal={openArtifactModal}
            level={TiaraNivel} setLevel={setTiaraNivel}
            mainStatType={TiaraMainStat} setMainStatType={setTiaraMainStat}
            subStats={TiaraSubStats} setSubStats={setTiaraSubStats}
            mainStatOptions={MAIN_STAT_OPTIONS.TIARA}
        />

        {/* --- BOTÓN DE GUARDAR --- */}
        <View style={{height: 20}} />
        <TouchableOpacity 
            style={[styles.saveButton, isSaving && {opacity: 0.7}]} 
            onPress={handleSaveCharacter}
            disabled={isSaving}
        >
            {isSaving ? (
                <ActivityIndicator color="#0f172a" />
            ) : (
                <>
                <Feather name="save" size={20} color="#0f172a" style={{marginRight: 10}} />
                <Text style={styles.saveButtonText}>Guardar Personaje</Text>
                </>
            )}
        </TouchableOpacity>
        <View style={{height: 40}} />

      </ScrollView>

      {/* MODALES */}
      <SelectionModal 
        visible={modalPersonajeVisible} title="Seleccionar Personaje" data={personajesLista} 
        onSelect={setPersonajeSeleccionado} onClose={() => setModalPersonajeVisible(false)}
      />
      <SelectionModal 
        visible={modalArmaVisible} title="Seleccionar Arma" data={armasFiltradas} 
        onSelect={setArmaSeleccionada} onClose={() => setModalArmaVisible(false)}
      />
      <ArtifactSelectionModal 
        visible={modalArtifactVisible} onClose={() => setModalArtifactVisible(false)} data={listaArtefactos} 
        onSelect={handleArtifactSelect} currentType={activeArtifactType}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent:'space-between',
    paddingHorizontal: 20, paddingTop: 40, paddingBottom: 10,
    backgroundColor: '#0f172a'
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  label: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 5, letterSpacing: 0.5 },
  valueBadge: { fontWeight: 'bold', fontSize: 14 },
  rowContainer: { flexDirection: 'row', marginBottom: 10 },
  imageCard: {
    width: 100, height: 140, backgroundColor: '#1e293b', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155', overflow: 'hidden'
  },
  cardImage: { width: '100%', height: '100%' },
  dropdownButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 8,
    marginBottom: 15, borderWidth: 1, borderColor: '#334155'
  },
  dropdownText: { color: 'white', flex: 1, marginLeft: 10, fontSize: 14 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  levelInput: { color: 'white', fontSize: 18, fontWeight: 'bold', borderBottomWidth: 2, textAlign: 'center', width: 40, marginRight: 5 },
  levelMaxText: { color: '#64748b', fontSize: 14, marginRight: 15 },
  maxButton: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  maxButtonText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 30 },
  talentsContainer: { backgroundColor: '#0f172a', borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', padding: 15 },
  talentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  
  // Botón Guardar
  saveButton: {
    backgroundColor: theme.colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 16, borderRadius: 12, marginTop: 10, elevation: 5
  },
  saveButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },

  // Estilos Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', height: '60%', backgroundColor: '#1e293b', borderRadius: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#334155' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemText: { color: 'white', fontSize: 16 },
});