import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';

/* =========================================================
   HOOKS DE LECTURA (GETTERS)
   ========================================================= */

// --- BASES (Catálogos) ---
export const usePersonajesBase = () => {
  return useQuery({
    queryKey: ['personajesBase'],
    queryFn: api.getPersonajesBase,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (rara vez cambian)
  });
};

export const useArmasBase = (tipo) => {
  return useQuery({
    queryKey: ['armasBase', tipo],
    queryFn: () => api.getArmasBase(tipo),
    staleTime: 1000 * 60 * 60, 
  });
};

export const useArtefactosBase = () => {
  return useQuery({
    queryKey: ['artefactosBase'],
    queryFn: api.getArtefactosBase,
    staleTime: 1000 * 60 * 60,
  });
};


// --- DATOS DE USUARIO ---
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => api.getPerfilUsuario(userId),
    enabled: !!userId,
  });
};
// --- ESTADÍSTICAS DE USUARIO ---
export const useUserStats = (userId) => {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => api.getUserStats(userId),
    enabled: !!userId, // Solo ejecuta si hay usuario
    staleTime: 1000 * 60 * 5, // Mantener fresco 5 minutos (no necesitamos contar a cada segundo)
  });
};


// --- MIS DATOS (Datos personalizados) ---
export const useMisPersonajes = (userId) => {
  return useQuery({
    queryKey: ['misPersonajes', userId],
    queryFn: () => api.getPersonajesUsuario(userId),
    enabled: !!userId,
  });
};

export const useMisArmas = (userId) => {
  return useQuery({
    queryKey: ['misArmas', userId],
    queryFn: () => api.getArmasUsuario(userId),
    enabled: !!userId,
  });
};

export const useMisArtefactos = (userId) => {
  return useQuery({
    queryKey: ['misArtefactos', userId],
    queryFn: () => api.getArtefactosUsuario(userId),
    enabled: !!userId,
  });
};

export const useMisEquipos = (userId) => {
  return useQuery({
    queryKey: ['misEquipos', userId],
    queryFn: () => api.getEquiposUsuario(userId),
    enabled: !!userId,
  });
};


/* =========================================================
   HOOKS DE ESCRITURA (MUTATIONS)
   ========================================================= */

// --- PERSONAJES ---
export const useCrearPersonaje = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPersonaje,
    onSuccess: () => queryClient.invalidateQueries(['misPersonajes']),
  });
};

export const useEditarPersonaje = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updatePersonajeCompleto,
    onSuccess: () => {
      // Invalidamos para que al volver al Hub, los datos se recarguen
      queryClient.invalidateQueries(['personajesCompletos']);
      queryClient.invalidateQueries(['misPersonajes']);
    },
  });
};

export const useBorrarPersonaje = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.deletePersonaje,
      onSuccess: () => queryClient.invalidateQueries(['misPersonajes']),
    });
};

// --- ARMAS ---
export const useCrearArma = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.createArma,
      onSuccess: () => queryClient.invalidateQueries(['misArmas']),
    });
};

export const useBorrarArma = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.deleteArma,
      onSuccess: () => queryClient.invalidateQueries(['misArmas']),
    });
};

// --- ARTEFACTOS ---
export const useCrearArtefacto = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.createArtefactoCompleto,
      onSuccess: () => queryClient.invalidateQueries(['misArtefactos']),
    });
};

export const useBorrarArtefacto = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.deleteArtefacto,
      onSuccess: () => queryClient.invalidateQueries(['misArtefactos']),
    });
};

// --- EQUIPOS ---
export const useCrearEquipo = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.createEquipoCompleto,
      onSuccess: () => queryClient.invalidateQueries(['misEquipos']),
    });
};

// Hook para traer todos los datos asociados a un personaje creado
export const usePersonajesCompletos = (userId) => {
  return useQuery({
    queryKey: ['personajesCompletos', userId],
    queryFn: () => api.getPersonajesCompletos(userId),
    enabled: !!userId,
  });
};


// Hook para traer todos los datos asociados a un equipo y sus miembros
export const useEquiposCompletos = (userId) => {
  return useQuery({
    queryKey: ['equiposCompletos', userId],
    queryFn: () => api.getEquiposCompletos(userId),
    enabled: !!userId,
  });
};



