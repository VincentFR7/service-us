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
  
  // Add new user
  users.push({ fullname, password, regiment, role: 'user' });
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  
  // Save password separately for persistence
  localStorage.setItem(`password_${fullname}`, password);
  
  return { success: true };
}

// Reset password for a user
function resetPassword(fullname, newPassword) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (userIndex === -1) {
    return { success: false, message: 'Utilisateur non trouvé' };
  }
  
  users[userIndex].password = newPassword;
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, newPassword);
  
  return { success: true, message: 'Mot de passe réinitialisé avec succès' };
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
    // Add new user
    users.push({ fullname, password, regiment, role });
  }
  
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  localStorage.setItem(`password_${fullname}`, password);
  
  return { fullname, role, regiment };
}

// Authenticate user
function authenticateUser(fullname, password) {
  const users = getUsers();
  const savedPassword = localStorage.getItem(`password_${fullname}`);
  
  // Check against saved password first
  if (savedPassword === password) {
    const user = users.find(u => u.fullname.toLowerCase() === fullname.toLowerCase());
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify({
        fullname: user.fullname,
        role: user.role,
        regiment: user.regiment
      }));
      return { success: true, user: { fullname: user.fullname, role: user.role, regiment: user.regiment } };
    }
  }
  
  // Fall back to checking users array
  const user = users.find(u => 
    u.fullname.toLowerCase() === fullname.toLowerCase() && 
    u.password === password
  );
  
  if (user) {
    // Save password for persistence
    localStorage.setItem(`password_${fullname}`, password);
    
    sessionStorage.setItem('currentUser', JSON.stringify({
      fullname: user.fullname,
      role: user.role,
      regiment: user.regiment
    }));
    return { success: true, user: { fullname: user.fullname, role: user.role, regiment: user.regiment } };
  }
  
  return { success: false, message: 'Nom ou mot de passe incorrect' };
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
  registerUser,
  resetPassword
};
