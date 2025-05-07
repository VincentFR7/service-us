/**
 * Authentication Service Module
 * Handles user authentication, password persistence, and user management
 */

// Default admin credentials
const DEFAULT_ADMINS = [
  { fullname: 'Vincent', password: 'admin', role: 'admin', regiment: '1st Infantry Division' },
  { fullname: 'Gérance', password: 'admin01051', role: 'admin', regiment: '1st Infantry Division' }
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
  const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
  // Ensure admins are always present
  DEFAULT_ADMINS.forEach(admin => {
    if (!users.some(u => u.fullname === admin.fullname)) {
      users.push(admin);
    }
  });
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  return users;
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
  const newUser = { 
    fullname, 
    password, 
    regiment, 
    role: 'user',
    securityQuestion: 'Quel est votre premier régiment?',
    securityAnswer: regiment,
    forcePasswordChange: false
  };
  
  users.push(newUser);
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, password);
  
  // Backup to IndexedDB
  backupToIndexedDB('users', users);
  
  return { success: true };
}

// Reset password using security question
function resetPasswordWithSecurity(fullname, securityAnswer, newPassword) {
  const users = getUsers();
  const user = users.find(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }
  
  if (securityAnswer && user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
    return { success: false, message: 'Réponse incorrecte à la question de sécurité.' };
  }
  
  user.password = newPassword;
  user.forcePasswordChange = false;
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, newPassword);
  
  // Backup to IndexedDB
  backupToIndexedDB('users', users);
  
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
  
  // Backup to IndexedDB
  backupToIndexedDB('users', users);
  
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
  
  // Backup to IndexedDB
  backupToIndexedDB('users', users);
  
  return { 
    success: true, 
    message: `${username} est maintenant ${users[userIndex].role === 'moderator' ? 'modérateur' : 'utilisateur'}`
  };
}

// Add a new user or update existing one
function saveUser(fullname, password, regiment, role = 'user') {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  const userData = { 
    fullname, 
    password, 
    regiment, 
    role,
    securityQuestion: 'Quel est votre premier régiment?',
    securityAnswer: regiment,
    forcePasswordChange: false
  };
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
  } else {
    // Add new user
    users.push(userData);
  }
  
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, password);
  
  // Backup to IndexedDB
  backupToIndexedDB('users', users);
  
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

// Backup data to IndexedDB
async function backupToIndexedDB(storeName, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put({ id: 1, data, timestamp: Date.now() });
    await tx.complete;
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

// Open IndexedDB connection
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ServiceTrackerBackup', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('serviceBackup')) {
        db.createObjectStore('serviceBackup', { keyPath: 'username' });
      }
    };
  });
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
