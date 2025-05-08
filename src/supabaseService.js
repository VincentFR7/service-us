import { supabase } from './supabaseClient';

// Récupérer tous les utilisateurs
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('fullname');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
}

// Récupérer un utilisateur par son nom complet
export async function getUserByFullname(fullname) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('fullname', fullname)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

// Créer un nouvel utilisateur
export async function createUser(userData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return { success: false, message: error.message };
  }
}

// Mettre à jour un utilisateur
export async function updateUser(id, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return { success: false, message: error.message };
  }
}

// Supprimer un utilisateur
export async function deleteUser(id) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return { success: false, message: error.message };
  }
}

// Mettre à jour la dernière connexion d'un utilisateur
export async function updateLastSeen(id) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de last_seen:', error);
    return { success: false, message: error.message };
  }
}