/**
 * Authentication Service Module
 * Handles user authentication, password persistence, and user management
 */

// Default admin credentials
const DEFAULT_ADMINS = [
  { fullname: 'Vincent', password: 'admin', role: 'admin' },
  { fullname: 'Admin', password: 'admin', role: 'admin' }
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

// Register a new user
function registerUser(fullname, password) {
  const users = getUsers();
  
  // Check if username already exists
  if (users.some(u => u.fullname.toLowerCase() === fullname.toLowerCase())) {
    return { success: false, message: 'Ce nom est déjà utilisé' };
  }
  
  // Add new user
  users.push({ fullname, password, role: 'user' });
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  
  // Save password separately for persistence
  localStorage.setItem(`password_${fullname}`, password);
  
  return { success: true };
}

// Add a new user or update existing one
function saveUser(fullname, password, role = 'user') {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.fullname.toLowerCase() === fullname.toLowerCase());
  
  if (existingUserIndex >= 0) {
    // Update existing user's password
    users[existingUserIndex].password = password;
  } else {
    // Add new user
    users.push({ fullname, password, role });
  }
  
  localStorage.setItem('serviceUsers', JSON.stringify(users));
  
  // Save password separately for persistence
  localStorage.setItem(`password_${fullname}`, password);
  
  return { fullname, role };
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
        role: user.role
      }));
      return { success: true, user: { fullname: user.fullname, role: user.role } };
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
      role: user.role
    }));
    return { success: true, user: { fullname: user.fullname, role: user.role } };
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
  saveUser,
  authenticateUser,
  getCurrentUser,
  logout,
  isAdmin,
  registerUser
};
