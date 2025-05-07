/**
 * Authentication Service Module
 * Handles user authentication, password persistence, and user management
 */

// Default admin credentials
const DEFAULT_ADMINS = [
  { fullname: 'Vincent', password: 'admin', role: 'admin', regiment: '1st Infantry Division' },
  { fullname: 'Field Admin', password: 'admin', role: 'admin', regiment: '1st Infantry Division' }
];

const REGIMENTS = [
  '1st Infantry Division',
  '783rd Military Police',
  '13e Génie',
  '3rd Armored',
  '101st Airbone Division',
  '188th Médical Battalion'
];

// Initialize users from localStorage or use defaults
function initializeUsers() {
  const storedUsers = localStorage.getItem('serviceUsers');
  if (!storedUsers) {
    localStorage.setItem('serviceUsers', JSON.stringify(DEFAULT_ADMINS));
    return DEFAULT_ADMINS;
  }
  return JSON.parse(storedUsers);
}

// Get all users
function getUsers() {
  return JSON.parse(localStorage.getItem('serviceUsers') || '[]');
}

// Get available regiments
function getRegiments() {
  return REGIMENTS;
}

// Register a new user
function registerUser(fullname, password, regiment) {
  const users = getUsers();
  
  // Check if username already exists
  if (users.some(u => u.fullname.toLowerCase() === fullname.toLowerCase())) {
    return { success: false, message: 'Ce nom est déjà utilisé' };
  }
  
  // Add new user with security question
  users.push({ 
    fullname, 
    password, 
    regiment, 
    role: 'user',
    securityQuestion: 'Quel est votre premier régiment?',
    securityAnswer: regiment,
    forcePasswordChange: false
  });
  
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, password);
  
  return { success: true };
}

// Reset password using security question
function resetPasswordWithSecurity(fullname, securityAnswer, newPassword) {
  const users = getUsers();
  const user = users.find(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }
  
  if (user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
    return { success: false, message: 'Réponse incorrecte à la question de sécurité.' };
  }
  
  user.password = newPassword;
  user.forcePasswordChange = false;
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, newPassword);
  
  return { success: true, message: 'Mot de passe réinitialisé avec succès' };
}

// Admin force password reset
function adminResetUserPassword(username) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.fullname.toLowerCase() === username.toLowerCase());
  
  if (userIndex === -1) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }
  
  const tempPassword = Math.random().toString(36).slice(-8);
  users[userIndex].password = tempPassword;
  users[userIndex].forcePasswordChange = true;
  
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${username}`, tempPassword);
  
  return { 
    success: true, 
    message: `Mot de passe temporaire: ${tempPassword}. L'utilisateur devra le changer à sa prochaine connexion.` 
  };
}

// Toggle user role between user and moderator
function toggleModeratorRole(username) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.fullname.toLowerCase() === username.toLowerCase());
  
  if (userIndex === -1) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }
  
  if (users[userIndex].role === 'admin') {
    return { success: false, message: 'Impossible de modifier le rôle d\'un administrateur' };
  }
  
  users[userIndex].role = users[userIndex].role === 'moderator' ? 'user' : 'moderator';
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  
  return { 
    success: true, 
    message: `${username} est maintenant ${users[userIndex].role === 'moderator' ? 'modérateur' : 'utilisateur'}`
  };
}

// Add a new user or update existing one
function saveUser(fullname, password, regiment, role = 'user') {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex].password = password;
    users[existingUserIndex].regiment = regiment;
  } else {
    // Add new user with security question
    users.push({ 
      fullname, 
      password, 
      regiment, 
      role,
      securityQuestion: 'Quel est votre premier régiment?',
      securityAnswer: regiment,
      forcePasswordChange: false
    });
  }
  
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, password);
  
  return { fullname, role, regiment };
}

// Authenticate user
function authenticateUser(fullname, password) {
  const users = getUsers();
  const user = users.find(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (!user) {
    return { success: false, message: 'Nom ou mot de passe incorrect' };
  }
  
  if (user.password !== password) {
    return { success: false, message: 'Nom ou mot de passe incorrect' };
  }
  
  sessionStorage.setItem('currentUser', JSON.stringify({
    fullname: user.fullname,
    role: user.role,
    regiment: user.regiment,
    forcePasswordChange: user.forcePasswordChange
  }));
  
  if (user.forcePasswordChange) {
    return { 
      success: true, 
      user: { 
        fullname: user.fullname, 
        role: user.role, 
        regiment: user.regiment,
        forcePasswordChange: true
      },
      message: 'Vous devez changer votre mot de passe'
    };
  }
  
  return { 
    success: true, 
    user: { 
      fullname: user.fullname, 
      role: user.role, 
      regiment: user.regiment,
      forcePasswordChange: false
    }
  };
}

// Get current authenticated user
function getCurrentUser() {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

// Logout current user
function logout() {
  sessionStorage.removeItem('currentUser');
}

// Check if user is admin
function isAdmin(user) {
  return user && user.role === 'admin';
}

// Check if user is moderator
function isModerator(user) {
  return user && (user.role === 'moderator' || user.role === 'admin');
}

// Initialize on module load
initializeUsers();

export {
  getUsers,
  getRegiments,
  saveUser,
  authenticateUser,
  getCurrentUser,
  logout,
  isAdmin,
  isModerator,
  registerUser,
  resetPasswordWithSecurity,
  adminResetUserPassword,
  toggleModeratorRole
};