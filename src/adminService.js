/**
 * Admin Service Module
 * Handles admin-specific functionality for managing users and service hours
 */

import { getUsers } from './authService.js';
import { 
  getUserServiceHistory, 
  resetUserServiceHistory,
  calculateTotalServiceDuration,
  resetAllServiceHistory
} from './serviceTracker.js';

// Get all users for admin display
function getUsersForAdmin() {
  // Filter out sensitive information like passwords
  return getUsers().map(user => ({
    fullname: user.fullname,
    role: user.role,
    regiment: user.regiment
  }));
}

// Get a specific user's service history
function getUserServiceDetails(username) {
  const history = getUserServiceHistory(username);
  const totalDuration = calculateTotalServiceDuration(username);
  
  return {
    username,
    history,
    totalDuration
  };
}

// Get all users' service information
function getAllUsersServiceInfo() {
  const users = getUsers();
  return users.map(user => {
    const history = getUserServiceHistory(user.fullname);
    const totalDuration = calculateTotalServiceDuration(user.fullname);
    
    return {
      fullname: user.fullname,
      role: user.role,
      regiment: user.regiment,
      history: history,
      totalDuration: totalDuration
    };
  });
}

// Reset a user's service hours (admin only)
function resetUserHours(username) {
  resetUserServiceHistory(username);
  return { success: true, message: `Les heures de service de ${username} ont été réinitialisées.` };
}

// Reset all users' service hours (admin only)
function resetAllHours() {
  resetAllServiceHistory();
  return { success: true, message: 'Les heures de service de tous les utilisateurs ont été réinitialisées.' };
}

// Delete a user account (admin only)
function deleteUser(username) {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.fullname !== username);
  
  if (users.length === filteredUsers.length) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }
  
  // Remove user data
  localStorage.setItem('serviceUsers', JSON.stringify(filteredUsers));
  localStorage.removeItem(`password_${username}`);
  localStorage.removeItem(`serviceHistory_${username}`);
  localStorage.removeItem(`serviceStatus_${username}`);
  
  return { success: true, message: `Le compte de ${username} a été supprimé` };
}

export {
  getUsersForAdmin,
  getUserServiceDetails,
  resetUserHours,
  resetAllHours,
  getAllUsersServiceInfo,
  deleteUser
};
