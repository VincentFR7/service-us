/**
 * Authentication Service Module
 * Handles user authentication, password persistence, and user management
 */

// Default admin credentials
const DEFAULT_ADMINS = [
  { fullname: 'Vincent', password: 'admin', role: 'admin', regiment: '1st Infantry Division' },
  { fullname: 'Gérance', password: 'GR4ND3_4RM33!', role: 'admin', regiment: '1st Infantry Division' }
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
  try {
    const storedUsers = localStorage.getItem('serviceUsers');
    if (!storedUsers) {
      localStorage.setItem('serviceUsers', JSON.stringify(DEFAULT_ADMINS));
      return DEFAULT_ADMINS;
    }
    return JSON.parse(storedUsers);
  } catch (error) {
    console.error('Error initializing users:', error);
    return DEFAULT_ADMINS;
  }
}

// Get all users
function getUsers() {
  let users = [];
  try {
    // Get users from localStorage
    users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
    
    // Ensure admins are always present
    DEFAULT_ADMINS.forEach(admin => {
      if (!users.some(u => u.fullname === admin.fullname)) {
        users.push(admin);
      }
    });
    
    // Update localStorage with complete user list
    localStorage.setItem('serviceUsers', JSON.stringify(users));
  } catch (error) {
    console.error('Error getting users:', error);
    users = DEFAULT_ADMINS;
  }
  
  return users;
}

// Get available regiments
function getRegiments() {
  return REGIMENTS;
}

// Register a new user
function registerUser(fullname, password, regiment) {
  if (!fullname || !password || !regiment) {
    return { success: false, message: 'Tous les champs sont obligatoires' };
  }

  const users = getUsers();
  
  // Check if username already exists
  if (users.some(u => u.fullname.toLowerCase() === fullname.toLowerCase())) {
    return { success: false, message: 'Ce nom est déjà utilisé' };
  }
  
  // Add new user
  const newUser = { 
    fullname, 
    password, 
    regiment, 
    role: 'user',
    securityQuestion: 'Quel est votre premier régiment?',
    securityAnswer: regiment,
    forcePasswordChange: false
  };
  
  try {
    users.push(newUser);
    localStorage.setItem('serviceUsers', JSON.stringify(users));
    return { success: true, message: 'Inscription réussie' };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: 'Erreur lors de l\'inscription' };
  }
}

// Reset password using security question
function resetPasswordWithSecurity(fullname, securityAnswer, newPassword) {
  if (!fullname || !newPassword) {
    return { success: false, message: 'Tous les champs sont obligatoires' };
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (userIndex === -1) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }

  if (securityAnswer && users[userIndex].securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
    return { success: false, message: 'Réponse incorrecte à la question de sécurité' };
  }
  
  try {
    users[userIndex].password = newPassword;
    users[userIndex].forcePasswordChange = false;
    localStorage.setItem('serviceUsers', JSON.stringify(users));
    return { success: true, message: 'Mot de passe réinitialisé avec succès' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'Erreur lors de la réinitialisation' };
  }
}

// Admin reset user password
function adminResetUserPassword(username) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.fullname === username);

  if (userIndex === -1) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }

  try {
    users[userIndex].password = 'password'; // Set default password
    users[userIndex].forcePasswordChange = true; // Force user to change password on next login
    localStorage.setItem('serviceUsers', JSON.stringify(users));
    return { success: true, message: `Mot de passe de ${username} réinitialisé à 'password'` };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'Erreur lors de la réinitialisation du mot de passe' };
  }
}

// Toggle moderator role
function toggleModeratorRole(username) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.fullname === username);

  if (userIndex === -1) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }

  try {
    // Toggle between user and moderator roles
    users[userIndex].role = users[userIndex].role === 'moderator' ? 'user' : 'moderator';
    localStorage.setItem('serviceUsers', JSON.stringify(users));
    return { 
      success: true, 
      message: `${username} est maintenant ${users[userIndex].role === 'moderator' ? 'modérateur' : 'utilisateur'}`
    };
  } catch (error) {
    console.error('Error toggling moderator role:', error);
    return { success: false, message: 'Erreur lors du changement de rôle' };
  }
}

// Save user data
function saveUser(user) {
  if (!user || !user.fullname) {
    return { success: false, message: 'Données utilisateur invalides' };
  }

  try {
    const users = getUsers();
    const index = users.findIndex(u => u.fullname === user.fullname);
    
    if (index === -1) {
      users.push(user);
    } else {
      users[index] = user;
    }
    
    localStorage.setItem('serviceUsers', JSON.stringify(users));
    return { success: true };
  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, message: 'Erreur lors de la sauvegarde' };
  }
}

// Authenticate user
function authenticateUser(fullname, password) {
  if (!fullname || !password) {
    return { success: false, message: 'Tous les champs sont obligatoires' };
  }

  const users = getUsers();
  const user = users.find(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (!user || user.password !== password) {
    return { success: false, message: 'Nom ou mot de passe incorrect' };
  }
  
  const userData = {
    fullname: user.fullname,
    role: user.role,
    regiment: user.regiment,
    forcePasswordChange: user.forcePasswordChange
  };

  sessionStorage.setItem('currentUser', JSON.stringify(userData));
  
  return { 
    success: true, 
    user: userData,
    message: user.forcePasswordChange ? 'Vous devez changer votre mot de passe' : undefined
  };
}

// Get current authenticated user
function getCurrentUser() {
  try {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Logout current user
function logout() {
  sessionStorage.removeItem('currentUser');
}

// Check if user is admin
function isAdmin(user) {
  return user && user.role === 'admin';
}

// Check if user is État-Major
function isModerator(user) {
  return user && (user.role === 'moderator' || user.role === 'admin');
}

// Initialize on module load
initializeUsers();

export {
  getUsers,
  getRegiments,
  authenticateUser,
  getCurrentUser,
  logout,
  isAdmin,
  isModerator,
  registerUser,
  resetPasswordWithSecurity,
  adminResetUserPassword,
  toggleModeratorRole,
  saveUser
};