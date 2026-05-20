import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, FlatList, Modal, Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { usePersonajesCompletos, useEquiposCompletos } from '../hooks/useGameData';
import { getElementColor } from '../utils/elementColors';
import { MAIN_STAT_OPTIONS,SUBSTAT_OPTIONS } from '../utils/artifactConstants'; 


const { width } = Dimensions.get('window');

// Orden oficial de artefactos para mostrar
const ARTIFACT_ORDER = ['FLOR', 'PLUMA', 'RELOJ', 'COPA', 'TIARA'];

export default function HubMain() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // --- ESTADOS Y DATOS ---
  const [activeTab, setActiveTab] = useState('PERSONAJES'); // 'PERSONAJES' | 'EQUIPOS'
  
  // Hooks potentes que traen toda la data relacional
  const { data: personajes = [], isLoading: loadingChars } = usePersonajesCompletos(user?.id);
  const { data: equipos = [], isLoading: loadingTeams } = useEquiposCompletos(user?.id);

  // Modales
  const [charModalVisible, setCharModalVisible] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Efecto para detectar parámetro inicial (navegación desde otra pantalla)
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params]);

  // --- HELPERS ---
  const getNombre = (p) => p?.nombre_personalizado || p?.personaje_base?.nombre || "Sin Nombre";
  const getImagen = (p) => p?.personaje_base?.imagen_route;
  
  // Ordenar artefactos de un personaje para mostrarlos en fila
  const getSortedArtifacts = (arts = []) => {
    const sorted = [];
    ARTIFACT_ORDER.forEach(tipo => {
      // Nota: En la DB el tipo es 'FLOR', 'PLUMA', etc. O 'flor' minúscula. Ajusta toUpperCase() si es necesario.
      const found = arts.find(a => a.artefacto_base?.tipo?.toUpperCase() === tipo);
      sorted.push(found || null); // null si no tiene esa pieza
    });
    return sorted;
  };

  // --- RENDERIZADO: TARJETA DE PERSONAJE (COMPACTA) ---
  const renderCharacterCard = (char, onPressOverride = null) => {
    const base = char.personaje_base;
    const arma = char.arma; // Supabase devuelve array en relaciones 1:N, tomamos el primero
    const arts = getSortedArtifacts(char.artefactos);
    const elementColor = getElementColor(base?.elemento);

    return (
      <TouchableOpacity 
        key={char.id_personaje}
        style={[styles.charCard, { borderColor: elementColor }]}
        onPress={() => onPressOverride ? onPressOverride() : openCharDetail(char)}
      >
        {/* CABECERA: FOTO Y NOMBRE */}
        <View style={styles.charHeader}>
          <Image source={{ uri: base?.imagen_route }} style={styles.charImage} />
          <View style={styles.charHeaderInfo}>
            <Text style={styles.charName} numberOfLines={1}>{getNombre(char)}</Text>
            <View style={styles.levelBadge}>
               <Text style={styles.levelText}>Lv.{char.nivel}</Text>
               <Text style={[styles.constText, {color: elementColor}]}>C{char.constelacion}</Text>
            </View>
          </View>
        </View>

        {/* CUERPO: TALENTOS Y ARMA */}
        <View style={styles.charBody}>
           <View style={styles.talentsRow}>
              <Text style={styles.microLabel}>Talentos: </Text>
              <Text style={styles.talentVal}>{char.talento_basico}/{char.talento_elemental}/{char.talento_ult}</Text>
           </View>
           
           <View style={styles.weaponRow}>
              {arma ? (
                  <>
                    <Image source={{ uri: arma.arma_base?.imagen_route }} style={styles.tinyIcon} />
                    <View>
                        <Text style={styles.weaponText} numberOfLines={1}>{arma.arma_base?.nombre}</Text>
                        <Text style={styles.weaponSub}>Lv.{arma.nivel} R{arma.refinamiento}</Text>
                    </View>
                  </>
              ) : (
                  <Text style={styles.missingText}>Sin Arma</Text>
              )}
           </View>
        </View>

        {/* PIE: ARTEFACTOS (ICONOS) */}
        <View style={styles.artifactsRow}>
            {arts.map((art, index) => (
                <View key={index} style={styles.artIconContainer}>
                    {art ? (
                        <Image source={{ uri: art.artefacto_base?.imagen_route }} style={styles.tinyArtIcon} />
                    ) : (
                        <View style={styles.emptyDot} />
                    )}
                </View>
            ))}
        </View>
      </TouchableOpacity>
    );
  };

  // --- RENDERIZADO: TARJETA DE EQUIPO ---
  const renderTeamCard = (team) => {
    const miembrosRaw = team.miembros || [];
    
    // 2. Ordenar
    const miembros = [...miembrosRaw].sort((a, b) => a.posicion - b.posicion);
    
    return (
      <TouchableOpacity 
        key={team.id_equipo}
        style={styles.teamCard}
        onPress={() => openTeamDetail(team)}
      >
        <View style={styles.teamHeader}>
            <Text style={styles.teamTitle}>{team.nombre}</Text>
            <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
            {miembros.map((m) => {
                const p = m.personaje;
                return (
                    <View key={m.posicion} style={styles.teamMemberCompact}>
                        <Image source={{ uri: p?.personaje_base?.imagen_route }} style={styles.teamMemberImg} />
                        <Text style={styles.teamMemberName} numberOfLines={1}>
                            {p?.nombre_personalizado || p?.personaje_base?.nombre}
                        </Text>
                    </View>
                )
            })}
        </ScrollView>
      </TouchableOpacity>
    );
  };

  // --- FUNCIONES MODALES ---
  const openCharDetail = (char) => {
    setSelectedChar(char);
    setCharModalVisible(true);
  };

  const openTeamDetail = (team) => {
    setSelectedTeam(team);
    setTeamModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER DE PESTAÑAS */}
      <View style={styles.tabsHeader}>
         <TouchableOpacity onPress={() => navigation.openDrawer()} style={{padding: 10}}>
             <Feather name="menu" size={24} color="white" />
         </TouchableOpacity>
         
         <View style={styles.tabsContainer}>
             <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'PERSONAJES' && styles.tabActive]}
                onPress={() => setActiveTab('PERSONAJES')}
             >
                 <Text style={[styles.tabText, activeTab === 'PERSONAJES' && styles.tabTextActive]}>Personajes</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'EQUIPOS' && styles.tabActive]}
                onPress={() => setActiveTab('EQUIPOS')}
             >
                 <Text style={[styles.tabText, activeTab === 'EQUIPOS' && styles.tabTextActive]}>Equipos</Text>
             </TouchableOpacity>
         </View>
         <View style={{width: 44}} /> 
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.contentArea}>
          {activeTab === 'PERSONAJES' ? (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                  {personajes.map(p => renderCharacterCard(p))}
                  <View style={{height: 80}} />
              </ScrollView>
          ) : (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                  {equipos.map(t => renderTeamCard(t))}
                  <View style={{height: 80}} />
              </ScrollView>
          )}
      </View>

      {/* BOTÓN FLOTANTE CREAR */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
            // Navega a la pantalla de creación correspondiente
            if(activeTab === 'PERSONAJES') navigation.navigate('CreacionPersonaje');
            else navigation.navigate('CreacionMain'); // O CreacionEquipo directamente
        }}
      >
        <Feather name="plus" size={32} color="#0f172a" />
      </TouchableOpacity>

      {/* --- MODAL DETALLE PERSONAJE --- */}
      <Modal visible={charModalVisible} animationType="fade" transparent={true} onRequestClose={() => setCharModalVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {selectedChar && (
                    <ScrollView>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailTitle}>{getNombre(selectedChar)}</Text>
                            <TouchableOpacity onPress={() => setCharModalVisible(false)}>
                                <Feather name="x" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>

                        {/* ARMA DETALLE */}
                        <Text style={styles.sectionTitle}>ARMA</Text>
                        <View style={styles.detailBox}>
                            {selectedChar.arma ? (
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <Image source={{uri: selectedChar.arma.arma_base.imagen_route}} style={{width:50, height:50, marginRight:10}} />
                                    <View>
                                        <Text style={{color:'white', fontWeight:'bold'}}>{selectedChar.arma.arma_base.nombre}</Text>
                                        <Text style={{color:'#94a3b8'}}>Nivel {selectedChar.arma.nivel} • Refinamiento {selectedChar.arma.refinamiento}</Text>
                                        <Text style={{color:'#fbbf24'}}>ATQ Base: {selectedChar.arma.arma_base.ataque_base}</Text>
                                    </View>
                                </View>
                            ) : <Text style={{color:'#64748b'}}>No equipada</Text>}
                        </View>

                        {/* ARTEFACTOS DETALLE */}
                        <Text style={styles.sectionTitle}>ARTEFACTOS</Text>
                        {getSortedArtifacts(selectedChar.artefactos).map((art, idx) => (
                            <View key={idx} style={styles.artDetailRow}>
                                {art ? (
                                    <>
                                        <Image source={{uri: art.artefacto_base.imagen_route}} style={{width:40, height:40, marginRight:10}} />
                                        <View style={{flex:1}}>
                                            <Text style={{color: theme.colors.primary, fontWeight:'bold', fontSize:12}}>{art.artefacto_base.nombre_set}</Text>
                                            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                                <Text style={{color:'white', fontWeight:'bold'}}>
                                                    {(MAIN_STAT_OPTIONS[art.artefacto_base?.tipo?.toUpperCase()]?.find(o => o.value === art.stat_principal)?.label) 
                                                    || 
                                                    (SUBSTAT_OPTIONS.find(o => o.value === art.stat_principal)?.label) 
                                                    || 
                                                    art.stat_principal} 
                                                    <Text style={{color:'#fbbf24'}}>{art.valor_principal}</Text></Text>
                                                <Text style={{color:'#94a3b8'}}>+{art.nivel}</Text>
                                            </View>
                                            {/* Substats */}
                                            <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                                                {art.substats?.map((sub, sIdx) => (
                                                    <Text key={sIdx} style={{color:'#cbd5e1', fontSize:10, marginRight:8}}>• {SUBSTAT_OPTIONS.find(s => s.value === sub.bono)?.label || sub.bono} {sub.valor}</Text>
                                                ))}
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <Text style={{color:'#475569', fontStyle:'italic', marginLeft: 50}}>Ranura vacía</Text>
                                )}
                            </View>
                        ))}
                        
                        <View style={{height:40}}/>
                    </ScrollView>
                )}
            </View>
         </View>
      </Modal>

      {/* --- MODAL DETALLE EQUIPO --- */}
      <Modal visible={teamModalVisible} animationType="slide" transparent={true} onRequestClose={() => setTeamModalVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {selectedTeam && (
                    <>
                        <View style={styles.detailHeader}>
                            <View>
                                <Text style={styles.detailTitle}>{selectedTeam.nombre}</Text>
                                <Text style={{color:'#94a3b8', fontSize:12}}>{selectedTeam.descripcion}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setTeamModalVisible(false)}>
                                <Feather name="x" size={24} color="white"/>
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{paddingTop: 10}}>
                             {selectedTeam.miembros
                                .sort((a,b) => a.posicion - b.posicion)
                                .map(m => {
                                    // Truco: Buscamos el personaje COMPLETO en la lista 'personajes' usando el ID
                                    // Así podemos reutilizar renderCharacterCard con todos los detalles (armas, etc)
                                    const fullChar = personajes.find(p => p.id_personaje === m.personaje.id_personaje);
                                    
                                    
                                    if(!fullChar) return null;

                                    return (
                                        <View key={m.posicion} style={{marginBottom: 20}}>
                                            <Text style={styles.posLabel}>Posición {m.posicion}</Text>
                                            {/* Reutilizamos la tarjeta, pero desactivamos el click para no abrir modal sobre modal */}
                                            {renderCharacterCard(fullChar, () => {})} 
                                        </View>
                                    );
                                })
                             }
                             <View style={{height:40}}/>
                        </ScrollView>
                    </>
                )}
            </View>
         </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  
  // Tabs
  tabsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40, paddingBottom: 10, backgroundColor: '#1e293b' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 20, padding: 4 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 16 },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { color: '#64748b', fontWeight: 'bold' },
  tabTextActive: { color: '#0f172a' },

  contentArea: { flex: 1 },
  scrollContent: { padding: 15 },

  // CHARACTER CARD
  charCard: { 
    backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, 
    marginBottom: 15, padding: 10, elevation: 3 
  },
  charHeader: { flexDirection: 'row', marginBottom: 10 },
  charImage: { width: 50, height: 50, borderRadius: 25, borderWidth:1, borderColor:'#334155' },
  charHeaderInfo: { marginLeft: 10, flex: 1, justifyContent:'center' },
  charName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  levelBadge: { flexDirection: 'row', alignItems:'center' },
  levelText: { color: '#94a3b8', fontSize: 12, marginRight: 8 },
  constText: { fontWeight: 'bold', fontSize: 12 },

  charBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  talentsRow: { flex: 1 },
  microLabel: { color: '#64748b', fontSize: 10 },
  talentVal: { color: 'white', fontWeight:'bold', fontSize: 14 },
  
  weaponRow: { flex: 1.5, flexDirection: 'row', alignItems:'center', justifyContent:'flex-end' },
  tinyIcon: { width: 20, height: 20, marginRight: 5 },
  weaponText: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold', maxWidth: 100 },
  weaponSub: { color: '#64748b', fontSize: 10 },
  missingText: { color: '#475569', fontSize: 10, fontStyle:'italic' },

  artifactsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#334155', paddingTop: 8 },
  artIconContainer: { width: 30, height: 30, alignItems:'center', justifyContent:'center' },
  tinyArtIcon: { width: 28, height: 28 },
  emptyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#334155' },

  // TEAM CARD
  teamCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  teamHeader: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', borderBottomWidth: 1, borderColor: '#334155', paddingBottom: 10 },
  teamTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  teamMemberCompact: { alignItems: 'center', marginRight: 15, width: 60 },
  teamMemberImg: { width: 50, height: 50, borderRadius: 25, marginBottom: 5 },
  teamMemberName: { color: '#94a3b8', fontSize: 10, textAlign:'center' },

  // FAB
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 10 },

  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { height: '85%', backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  detailHeader: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#334155' },
  detailTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { color: theme.colors.textMuted, fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 10, letterSpacing: 1 },
  detailBox: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12 },
  
  artDetailRow: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#1e293b', padding: 8, borderRadius: 8 },
  posLabel: { color: theme.colors.textSecondary, marginBottom: 5, fontWeight:'bold' }
});