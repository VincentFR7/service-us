import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      console.error('Erreur de connexion:', error.message);
      return {
        connected: false,
        message: 'Non connecté à Supabase. Erreur: ' + error.message
      };
    }
    
    return {
      connected: true,
      message: 'Connecté à Supabase avec succès!'
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      connected: false,
      message: 'Non connecté à Supabase. Erreur: ' + error.message
    };
  }
}