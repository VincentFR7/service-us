import { supabase } from './supabaseClient';

// Script pour migrer les données de localStorage vers Supabase
export async function migrateDataToSupabase() {
  try {
    // Récupérer les utilisateurs de localStorage
    const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
    
    // Migrer chaque utilisateur
    for (const user of users) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('fullname', user.fullname)
        .single();
      
      if (!existingUser) {
        await supabase.from('users').insert([{
          fullname: user.fullname,
          password: user.password,
          regiment: user.regiment,
          role: user.role,
          force_password_change: user.forcePasswordChange || false
        }]);
      }
    }
    
    console.log('Migration des utilisateurs terminée');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return { success: false, message: error.message };
  }
}