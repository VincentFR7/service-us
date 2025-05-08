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
import { isUserOnline } from './dataService.js';

// Get all users for admin display
function getUsersForAdmin() {
  // Filter out sensitive information like passwords
  return getUsers().map(user => ({
    fullname: user.fullname,
    role: user.role,
    regiment: user.regiment,
    isOnline: isUserOnline(user.fullname)
  }));
}

// Get a specific user's service history
function getUserServiceDetails(username) {
  const history = getUserServiceHistory(username);
  const totalDuration = calculateTotalServiceDuration(username);
  const isOnline = isUserOnline(username);
  
  return {
    username,
    history,
    totalDuration,
    isOnline
  };
}

// Get all users' service information grouped by regiment
function getAllUsersServiceInfo() {
  const users = getUsers();
  const usersByRegiment = {};
  
  // Group users by regiment
  users.forEach(user => {
    if (user.role !== 'admin') { // Don't show admin hours
      const history = getUserServiceHistory(user.fullname);
      const totalDuration = calculateTotalServiceDuration(user.fullname);
      const isOnline = isUserOnline(user.fullname);
      
      if (!usersByRegiment[user.regiment]) {
        usersByRegiment[user.regiment] = [];
      }
      
      usersByRegiment[user.regiment].push({
        fullname: user.fullname,
        role: user.role,
        regiment: user.regiment,
        history: history,
        totalDuration: totalDuration,
        isOnline: isOnline
      });
    }
  });
  
  return usersByRegiment;
}

// Reset a user's service hours (admin/moderator only)
function resetUserHours(username, currentUser) {
  // Get user's regiment
  const users = getUsers();
  const targetUser = users.find(u => u.fullname === username);
  
  // Check permissions
  if (!targetUser) return { success: false, message: 'Utilisateur non trouvé' };
  
  // Moderators can only reset hours for their own regiment
  if (currentUser.role === 'moderator' && targetUser.regiment !== currentUser.regiment) {
    return { 
      success: false, 
      message: 'Vous ne pouvez réinitialiser que les heures des membres de votre régiment' 
    };
  }
  
  resetUserServiceHistory(username);
  return { success: true, message: `Les heures de service de ${username} ont été réinitialisées.` };
}

// Reset all users' service hours (admin only)
function resetAllHours(currentUser) {
  if (currentUser.role !== 'admin') {
    return { 
      success: false, 
      message: 'Seuls les administrateurs peuvent réinitialiser toutes les heures' 
    };
  }
  
  resetAllServiceHistory();
  return { success: true, message: 'Les heures de service de tous les utilisateurs ont été réinitialisées.' };
}

// Reset service hours for a specific regiment (admin/moderator only)
function resetRegimentHours(regiment, currentUser) {
  // Moderators can only reset their own regiment
  if (currentUser.role === 'moderator' && regiment !== currentUser.regiment) {
    return { 
      success: false, 
      message: 'Vous ne pouvez réinitialiser que les heures de votre régiment' 
    };
  }
  
  const users = getUsers();
  let resetCount = 0;
  
  users.forEach(user => {
    if (user.regiment === regiment && user.role !== 'admin') {
      resetUserServiceHistory(user.fullname);
      resetCount++;
    }
  });
  
  return { 
    success: true, 
    message: `Les heures de service de ${resetCount} membres du régiment ${regiment} ont été réinitialisées.` 
  };
}

// Delete a user account (admin only)
function deleteUser(username, currentUser) {
  if (currentUser.role !== 'admin') {
    return { 
      success: false, 
      message: 'Seuls les administrateurs peuvent supprimer des utilisateurs' 
    };
  }
  
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
  localStorage.removeItem(`lastSeen_${username}`);
  
  return { success: true, message: `Le compte de ${username} a été supprimé` };
}

export {
  getUsersForAdmin,
  getUserServiceDetails,
  resetUserHours,
  resetAllHours,
  resetRegimentHours,
  getAllUsersServiceInfo,
  deleteUser
};
