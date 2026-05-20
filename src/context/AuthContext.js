import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Ahora guardará Auth + Perfil de DB
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Función auxiliar para traer los datos de tu tabla personalizada
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('id_usuario', userId)
        .single();

      if (error) {
        console.error('Error cargando perfil:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetchUserProfile:', error);
      return null;
    }
  };

  // 2. Función unificada para manejar la sesión y cargar el perfil
  const handleSession = async (currentSession) => {
    if (currentSession?.user) {
      // Si hay usuario logueado, buscamos sus datos extra en la DB
      const profile = await fetchUserProfile(currentSession.user.id);
      
      if (profile) {
        // COMBINAMOS: Datos de Auth (email, id) + Datos de DB (nombre, rol, imagen)
        setUser({ ...currentSession.user, ...profile });
      } else {
        // Fallback si no encuentra perfil (raro, pero posible)
        setUser(currentSession.user);
      }
    } else {
      // Si no hay sesión, limpiamos el usuario
      setUser(null);
    }
    setSession(currentSession);
    setLoading(false);
  };

  useEffect(() => {
    // A. Verificar sesión inicial al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // B. Escuchar cambios (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, username, uidGenshin) => {
    // 1. Crear usuario en Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // 2. Insertar perfil en DB
    if (data.user) {
      const newProfileData = {
        id_usuario: data.user.id,
        id_usuario_genshin: uidGenshin,
        nombre: username,
        correo: email,
        contrasena: password, // (Nota: Guardar contraseñas en texto plano no es recomendado, Supabase Auth ya la maneja segura)
        rol: 'usuario',
        fecha_registro: new Date().toISOString(),
        imagen_route: "https://wiki.hoyolab.com/_ipx/f_webp/https://bbs.hoyolab.com/hoyowiki/picture/enemy/Anemo%2520Slime_icon.png"
      };

      const { error: dbError } = await supabase
        .from('usuario')
        .insert(newProfileData);

      if (dbError) {
        console.error("Error creando perfil:", dbError);
        await supabase.auth.signOut(); // Rollback por seguridad
        throw new Error("Error al guardar datos del perfil: " + dbError.message);
      }

      // 3. Forzar inicio de sesión si es necesario
      if (!data.session) {
         const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
         });
         if (loginError) throw loginError;
         
         // Al hacer signIn, se disparará onAuthStateChange automáticamente 
         // y ejecutará handleSession, cargando el usuario.
      } else {
         // Si ya hay sesión (signUp auto-login), actualizamos el estado manualmente
         // para que la UI reaccione instantáneamente
         setUser({ ...data.user, ...newProfileData });
      }
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // No necesitamos hacer nada más aquí, onAuthStateChange detectará el login y cargará el perfil
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Exponemos una función extra 'refreshProfile' por si cambias el nombre/foto y quieres recargar sin reloguear
  const refreshProfile = async () => {
      if(user?.id) {
          const profile = await fetchUserProfile(user.id);
          if(profile) setUser({ ...user, ...profile });
      }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);