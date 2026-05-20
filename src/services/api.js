import { supabase } from './supabase';

/* =========================================================
   1. BASES DE DATOS (Catálogos - SOLO LECTURA)
   ========================================================= */

export const getPersonajesBase = async () => {
  const { data, error } = await supabase.from('personaje_base').select('*').order('nombre');
  if (error) throw error;
  return data;
};

export const getArmasBase = async (tipo = null) => {
  let query = supabase.from('arma_base').select('*').order('nombre');
  if (tipo) query = query.eq('tipo', tipo);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getArtefactosBase = async () => {
  const { data, error } = await supabase.from('artefacto_base').select('*').order('nombre_set');
  if (error) throw error;
  return data;
};

/* =========================================================
   2. USUARIO (Perfil)
   ========================================================= */

export const getPerfilUsuario = async (userId) => {
  // Buscamos por ID (uuid) que es más seguro y rápido que el correo
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('id_usuario', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updatePerfilUsuario = async ({ userId, updates }) => {
  const { data, error } = await supabase
    .from('usuario')
    .update(updates)
    .eq('id_usuario', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/* =========================================================
   3. PERSONAJES (Mis Builds)
   ========================================================= */

export const getPersonajesUsuario = async (userId) => {

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('personaje_creado')
    .select(`
      *,
      personaje_base:id_personaje_base (nombre, elemento, estrellas, region, imagen_route)
    `)
    .eq('id_usuario', userId);

  if (error) {
    throw error;
  }
  
  return data;
};

export const createPersonaje = async (buildData) => {
  const { data, error } = await supabase.from('personaje_creado').insert(buildData).select().single();
  if (error) throw error;
  return data;
};

export const updatePersonaje = async ({ id_personaje, updates }) => {
  const { data, error } = await supabase
    .from('personaje_creado')
    .update(updates)
    .eq('id_personaje', id_personaje)
    .select().single();
  if (error) throw error;
  return data;
};

export const deletePersonaje = async (id_personaje) => {
  const { error } = await supabase.from('personaje_creado').delete().eq('id_personaje', id_personaje);
  if (error) throw error;
  return id_personaje;
};

/* =========================================================
   4. ARMAS (Mis Armas)
   ========================================================= */

export const getArmasUsuario = async (userId) => {
  const { data, error } = await supabase
    .from('arma_creada')
    .select(`
      *,
      arma_base:id_arma_base (nombre, estrellas, tipo, imagen_route, ataque_base)
    `)
    .eq('id_usuario', userId);
  if (error) throw error;
  return data;
};

export const createArma = async (armaData) => {
  const { data, error } = await supabase.from('arma_creada').insert(armaData).select().single();
  if (error) throw error;
  return data;
};

export const updateArma = async ({ id_arma, updates }) => {
  const { data, error } = await supabase
    .from('arma_creada')
    .update(updates)
    .eq('id_arma', id_arma)
    .select().single();
  if (error) throw error;
  return data;
};

export const deleteArma = async (id_arma) => {
  const { error } = await supabase.from('arma_creada').delete().eq('id_arma', id_arma);
  if (error) throw error;
  return id_arma;
};

/* =========================================================
   5. ARTEFACTOS (Mis Artefactos + Substats)
   ========================================================= */

export const getArtefactosUsuario = async (userId) => {
  // JOIN IMPORTANTE: Traemos el artefacto, sus datos base y sus substats en UNA SOLA llamada
  const { data, error } = await supabase
    .from('artefacto_creado')
    .select(`
      *,
      artefacto_base:id_artefacto_base (nombre_set, imagen_route, tipo),
      substats:bono_artefacto_secundario (*)
    `)
    .eq('id_usuario', userId);
  if (error) throw error;
  return data;
};

// Crear artefacto es complejo: Primero el artefacto, luego sus substats
export const createArtefactoCompleto = async ({ artefactoData, substatsData }) => {
  // 1. Insertar Artefacto
  const { data: artData, error: artError } = await supabase
    .from('artefacto_creado')
    .insert(artefactoData)
    .select()
    .single();
  
  if (artError) throw artError;

  // 2. Insertar Substats (si existen)
  if (substatsData && substatsData.length > 0) {
    const substatsConId = substatsData.map(sub => ({
      ...sub,
      id_artefacto_creado: artData.id_artefacto // Vinculamos FK
    }));

    const { error: subError } = await supabase
      .from('bono_artefacto_secundario')
      .insert(substatsConId);
    
    if (subError) throw subError; // Ojo: Si falla aquí, quedaría el artefacto sin substats (podríamos borrarlo, pero por simplicidad lo dejamos así)
  }

  return artData;
};

export const updateArtefacto = async ({ id_artefacto, updates }) => {
    // Solo actualiza datos principales (nivel, stat principal). 
    // Para substats sería una lógica de borrar e insertar, o actualizar uno por uno.
    const { data, error } = await supabase
      .from('artefacto_creado')
      .update(updates)
      .eq('id_artefacto', id_artefacto)
      .select().single();
    if (error) throw error;
    return data;
};

export const deleteArtefacto = async (id_artefacto) => {
  // Supabase borrará los substats automáticamente si tienes configurado "ON DELETE CASCADE" en la DB (Recomendado)
  const { error } = await supabase.from('artefacto_creado').delete().eq('id_artefacto', id_artefacto);
  if (error) throw error;
  return id_artefacto;
};

/* =========================================================
   6. EQUIPOS
   ========================================================= */

export const getEquiposUsuario = async (userId) => {
  const { data, error } = await supabase
    .from('equipo')
    .select(`
        *,
        miembros:equipo_miembros (
            id_personaje_creado
        )
    `)
    .eq('id_usuario', userId);
  if (error) throw error;
  return data;
};

export const createEquipoCompleto = async ({ equipoData, miembros }) => { 
  // CORRECCIÓN 1: Cambiamos 'miembrosIds' por 'miembros' para coincidir con lo que envías
  
  // 1. Crear Equipo (Esto estaba bien)
  const { data: eqData, error: eqError } = await supabase
    .from('equipo')
    .insert(equipoData)
    .select()
    .single();
    
  if (eqError) throw eqError;

  const newTeamId = eqData.id_equipo; // Ya tenemos el ID del padre

  // 2. Insertar Miembros
  // Ahora sí validamos 'miembros'
  if (miembros && miembros.length > 0) {
      
      const miembrosInsert = miembros.map(m => ({
          id_equipo: newTeamId,             // FK: Conectamos con el equipo recién creado
          id_personaje_creado: m.id_personaje_creado, // CORRECCIÓN 2: Accedemos al objeto
          posicion: m.posicion              // CORRECCIÓN 3: Guardamos la posición
      }));
      
      const { error: mbError } = await supabase
        .from('equipo_miembros')
        .insert(miembrosInsert);
        
      if (mbError) {
          // Opcional: Si fallan los miembros, podrías borrar el equipo para no dejar basura
          // await supabase.from('equipo').delete().eq('id_equipo', newTeamId);
          throw mbError;
      }
  }

  return eqData;
};

export const deleteEquipo = async (id_equipo) => {
    const { error } = await supabase.from('equipo').delete().eq('id_equipo', id_equipo);
    if (error) throw error;
    return id_equipo;
};



// ... (Tus otras funciones) ...

// 1. GET PERSONAJES COMPLETOS (Con Arma y Artefactos)
export const getPersonajesCompletos = async (userId) => {
  const { data, error } = await supabase
    .from('personaje_creado')
    .select(`
      *,
      personaje_base:id_personaje_base (*),
      arma:arma_creada (
        *,
        arma_base:id_arma_base (*)
      ),
      artefactos:artefacto_creado (
        *,
        artefacto_base:id_artefacto_base (*),
        substats:bono_artefacto_secundario (*)
      )
    `)
    .eq('id_usuario', userId)
    .order('nivel', { ascending: false });

  if (error) throw error;
  return data;
};

// 2. GET EQUIPOS COMPLETOS (Con Miembros y sus nombres base)
export const getEquiposCompletos = async (userId) => {
  const { data, error } = await supabase
    .from('equipo')
    .select(`
      *,
      miembros:equipo_miembros (
        posicion,
        personaje:id_personaje_creado (
           id_personaje,
           nombre_personalizado,
           personaje_base:id_personaje_base (nombre, imagen_route, elemento)
        )
      )
    `)
    .eq('id_usuario', userId)
    .order('id_equipo', { ascending: false });

  if (error) throw error;
  return data;
};
// Agrega esto en src/services/api.js

export const updatePersonajeCompleto = async ({ id_personaje, id_usuario, charData, armaData, artifactsData }) => {
  // 1. ACTUALIZAR PERSONAJE (Tabla Padre)
  const { error: charError } = await supabase
    .from('personaje_creado')
    .update(charData)
    .eq('id_personaje', id_personaje); // IMPORTANTE: WHERE id = X

  if (charError) throw charError;

  // 2. ACTUALIZAR ARMA
  // Buscamos el arma que pertenece a este personaje y actualizamos sus datos
  const { error: armaError } = await supabase
    .from('arma_creada')
    .update(armaData)
    .eq('id_personaje_equipado', id_personaje);

  if (armaError) throw armaError;

  // 3. ARTEFACTOS: ESTRATEGIA "WIPE & REPLACE"
  // A. Borramos los artefactos viejos asociados a este personaje
  // (Gracias al CASCADE de tu DB, esto borra también los substats viejos automáticamente)
  const { error: delError } = await supabase
    .from('artefacto_creado')
    .delete()
    .eq('id_personaje_equipado', id_personaje);

  if (delError) throw delError;

  // B. Insertamos los nuevos (Igual que en crear)
  if (artifactsData && artifactsData.length > 0) {
      for (const art of artifactsData) {
          // 1. Insertar Artefacto
          const { data: newArt, error: artError } = await supabase
              .from('artefacto_creado')
              .insert({
                  ...art.artefactoData,
                  id_personaje_equipado: id_personaje // Asegurar vínculo
              })
              .select()
              .single();
          
          if (artError) throw artError;

          // 2. Insertar Substats
          if (art.substatsData && art.substatsData.length > 0) {
              const subsWithId = art.substatsData.map(s => ({
                  ...s,
                  id_artefacto_creado: newArt.id_artefacto
              }));
              const { error: subError } = await supabase
                  .from('bono_artefacto_secundario')
                  .insert(subsWithId);
              if (subError) throw subError;
          }
      }
  }

  return { success: true };
};


// ... imports existentes

// --- ESTADÍSTICAS DEL USUARIO ---

export const getUserStats = async (userId) => {
  // Disparamos las 4 peticiones en PARALELO para que sea ultra rápido
  const [personajes, armas, artefactos, equipos] = await Promise.all([
    
    // 1. Personajes
    supabase
      .from('personaje_creado')
      .select('*', { count: 'exact', head: true }) // head: true evita descargar los datos, solo cuenta
      .eq('id_usuario', userId),

    // 2. Armas
    supabase
      .from('arma_creada')
      .select('*', { count: 'exact', head: true })
      .eq('id_usuario', userId),

    // 3. Artefactos
    supabase
      .from('artefacto_creado')
      .select('*', { count: 'exact', head: true })
      .eq('id_usuario', userId),

    // 4. Equipos
    supabase
      .from('equipo')
      .select('*', { count: 'exact', head: true })
      .eq('id_usuario', userId)
  ]);

  // Si alguna falló, lanzamos el error de la primera que falló
  if (personajes.error) throw personajes.error;
  if (armas.error) throw armas.error;
  if (artefactos.error) throw artefactos.error;
  if (equipos.error) throw equipos.error;

  // Retornamos un objeto limpio con los totales
  return {
    totalPersonajes: personajes.count || 0,
    totalArmas: armas.count || 0,
    totalArtefactos: artefactos.count || 0,
    totalEquipos: equipos.count || 0
  };
};