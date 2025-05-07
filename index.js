/**
 * Military Service Tracking System
 * Main entry point for the application
 * Created by Vincent Steven
 */

import { 
  authenticateUser, 
  saveUser, 
  getCurrentUser, 
  logout, 
  isAdmin,
  registerUser,
  resetPassword,
  getRegiments
} from './src/authService.js';

import { 
  formatTime, 
  formatDuration, 
  getUserServiceHistory, 
  calculateTotalServiceDuration, 
  getCurrentServiceStatus, 
  startService, 
  endService,
  isGModRunning 
} from './src/serviceTracker.js';

import { 
  getUsersForAdmin, 
  getUserServiceDetails, 
  resetUserHours,
  resetAllHours
} from './src/adminService.js';

// DOM elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const resetPasswordSection = document.getElementById('reset-password-section');
const serviceSection = document.getElementById('service-section');
const adminSection = document.getElementById('admin-section');

const fullnameInput = document.getElementById('fullname');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const resetPasswordLink = document.getElementById('reset-password-link');

const regFullnameInput = document.getElementById('reg-fullname');
const regRegimentSelect = document.getElementById('reg-regiment');
const regPasswordInput = document.getElementById('reg-password');
const regConfirmPasswordInput = document.getElementById('reg-confirm-password');
const completeRegisterBtn = document.getElementById('complete-register-btn');
const backToLoginBtn = document.getElementById('back-to-login-btn');

const resetFullnameInput = document.getElementById('reset-fullname');
const resetNewPasswordInput = document.getElementById('reset-new-password');
const resetConfirmPasswordInput = document.getElementById('reset-confirm-password');
const completeResetBtn = document.getElementById('complete-reset-btn');
const backToLoginFromResetBtn = document.getElementById('back-to-login-from-reset-btn');

const userFullnameSpan = document.getElementById('user-fullname');
const userRegimentSpan = document.getElementById('user-regiment');
const serviceStatusSpan = document.getElementById('service-status');
const startServiceBtn = document.getElementById('start-service-btn');
const endServiceBtn = document.getElementById('end-service-btn');
const serviceStartSpan = document.getElementById('service-start');
const serviceEndSpan = document.getElementById('service-end');
const serviceDurationSpan = document.getElementById('service-duration');
const totalServiceHoursSpan = document.getElementById('total-service-hours');
const historyList = document.getElementById('history-list');
const logoutBtn = document.getElementById('logout-btn');

const adminFullnameSpan = document.getElementById('admin-fullname');
const userSelect = document.getElementById('user-select');
const viewHoursBtn = document.getElementById('view-hours-btn');
const resetHoursBtn = document.getElementById('reset-hours-btn');
const resetAllHoursBtn = document.getElementById('reset-all-hours-btn');
const selectedUserSpan = document.getElementById('selected-user');
const userHoursList = document.getElementById('user-hours-list');
const totalHoursSpan = document.getElementById('total-hours');

// Timer variables
let serviceTimer;
let currentStartTime;

// Initialize the application
function initApp() {
  addEventListeners();
  populateRegiments();
  checkAuthenticationStatus();
}

// Add event listeners to all interactive elements
function addEventListeners() {
  // Login events
  loginBtn.addEventListener('click', handleLogin);
  registerBtn.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
    regFullnameInput.focus();
  });
  
  resetPasswordLink.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    resetPasswordSection.classList.remove('hidden');
    resetFullnameInput.focus();
  });
  
  // Registration events
  completeRegisterBtn.addEventListener('click', handleRegistration);
  backToLoginBtn.addEventListener('click', () => {
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    fullnameInput.focus();
  });
  
  // Password reset events
  completeResetBtn.addEventListener('click', handlePasswordReset);
  backToLoginFromResetBtn.addEventListener('click', () => {
    resetPasswordSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    fullnameInput.focus();
  });
  
  // Service tracking events
  startServiceBtn.addEventListener('click', handleStartService);
  endServiceBtn.addEventListener('click', handleEndService);
  logoutBtn.addEventListener('click', handleLogout);
  
  // Admin events
  viewHoursBtn.addEventListener('click', handleViewUserHours);
  resetHoursBtn.addEventListener('click', handleResetUserHours);
  resetAllHoursBtn.addEventListener('click', handleResetAllHours);
  
  // Enter key handlers
  passwordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  
  regConfirmPasswordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleRegistration();
  });
  
  resetConfirmPasswordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handlePasswordReset();
  });
}

// Populate regiment select options
function populateRegiments() {
  const regiments = getRegiments();
  regRegimentSelect.innerHTML = '<option value="">Sélectionnez votre régiment</option>';
  
  regiments.forEach(regiment => {
    const option = document.createElement('option');
    option.value = regiment;
    option.textContent = regiment;
    regRegimentSelect.appendChild(option);
  });
}

// Handle registration button click
function handleRegistration() {
  const fullname = regFullnameInput.value.trim();
  const regiment = regRegimentSelect.value.trim();
  const password = regPasswordInput.value.trim();
  const confirmPassword = regConfirmPasswordInput.value.trim();
  
  if (!fullname || !regiment || !password || !confirmPassword) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }
  
  const result = registerUser(fullname, password, regiment);
  
  if (result.success) {
    alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    fullnameInput.value = fullname;
    passwordInput.value = '';
    passwordInput.focus();
    
    // Clear registration form
    regFullnameInput.value = '';
    regRegimentSelect.value = '';
    regPasswordInput.value = '';
    regConfirmPasswordInput.value = '';
  } else {
    alert(result.message);
  }
}

// Handle password reset
function handlePasswordReset() {
  const fullname = resetFullnameInput.value.trim();
  const newPassword = resetNewPasswordInput.value.trim();
  const confirmPassword = resetConfirmPasswordInput.value.trim();
  
  if (!fullname || !newPassword || !confirmPassword) {
    alert('Veuillez remplir tous les champs');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }
  
  const result = resetPassword(fullname, newPassword);
  
  if (result.success) {
    alert(result.message);
    resetPasswordSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    fullnameInput.value = fullname;
    passwordInput.focus();
    
    // Clear reset form
    resetFullnameInput.value = '';
    resetNewPasswordInput.value = '';
    resetConfirmPasswordInput.value = '';
  } else {
    alert(result.message);
  }
}

// Handle login button click
function handleLogin() {
  const fullname = fullnameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!fullname || !password) {
    alert('Veuillez entrer votre nom et votre mot de passe');
    return;
  }
  
  const authResult = authenticateUser(fullname, password);
  
  if (authResult.success) {
    // Save/update user in case password changed
    saveUser(fullname, password, authResult.user.regiment, authResult.user.role);
    
    // Navigate to admin section if admin
    if (isAdmin(authResult.user)) {
      showAdminDashboard(authResult.user);
    } else {
      showServiceDashboard(authResult.user);
    }
    
    // Clear login form
    passwordInput.value = '';
  } else {
    alert(authResult.message);
  }
}

// Handle start service button click
async function handleStartService() {
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    const status = await startService(user.fullname);
    currentStartTime = status.startTime;
    
    // Update UI
    startServiceBtn.classList.add('disabled');
    endServiceBtn.classList.remove('disabled');
    serviceStatusSpan.textContent = 'En service';
    serviceStatusSpan.style.color = 'var(--success-color)';
    serviceStartSpan.textContent = formatTime(new Date(status.startTime));
    serviceEndSpan.textContent = '--:--:--';
    
    // Start timer
    startServiceTimer(status.startTime);
  } catch (error) {
    alert(error.message);
  }
}

// Handle end service button click
function handleEndService() {
  const user = getCurrentUser();
  if (!user) return;
  
  const record = endService(user.fullname);
  if (!record) return;
  
  // Stop timer
  clearInterval(serviceTimer);
  
  // Update UI
  startServiceBtn.classList.remove('disabled');
  endServiceBtn.classList.add('disabled');
  serviceStatusSpan.textContent = 'Hors service';
  serviceStatusSpan.style.color = 'var(--danger-color)';
  serviceEndSpan.textContent = record.endTime;
  serviceDurationSpan.textContent = record.formattedDuration;
  
  // Refresh history
  loadUserServiceHistory(user.fullname);
}

// Handle logout button click
function handleLogout() {
  const user = getCurrentUser();
  if (user) {
    // If service is active, end it
    const status = getCurrentServiceStatus(user.fullname);
    if (status.isActive) {
      handleEndService();
    }
    
    // Clear intervals
    clearInterval(serviceTimer);
    
    // Logout
    logout();
    
    // Show login screen
    showLoginScreen();
  }
}

// Handle admin viewing user hours
function handleViewUserHours() {
  const selectedUsername = userSelect.value;
  if (!selectedUsername) return;
  
  loadUserHoursForAdmin(selectedUsername);
}

// Handle admin resetting user hours
function handleResetUserHours() {
  const selectedUsername = userSelect.value;
  if (!selectedUsername) {
    alert('Veuillez sélectionner un utilisateur');
    return;
  }
  
  if (confirm(`Êtes-vous sûr de vouloir réinitialiser les heures de service de ${selectedUsername}?`)) {
    const result = resetUserHours(selectedUsername);
    if (result.success) {
      alert(result.message);
      loadUserHoursForAdmin(selectedUsername);
    }
  }
}

// Handle admin resetting all users' hours
function handleResetAllHours() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser les heures de service de TOUS les utilisateurs?')) {
    const result = resetAllHours();
    if (result.success) {
      alert(result.message);
      loadUsersForAdmin();
    }
  }
}

// Start service timer to track duration
function startServiceTimer(startTime) {
  clearInterval(serviceTimer);
  
  serviceTimer = setInterval(() => {
    const currentTime = new Date().getTime();
    const durationInSeconds = Math.floor((currentTime - startTime) / 1000);
    serviceDurationSpan.textContent = formatDuration(durationInSeconds);
  }, 1000);
}

// Check if user is already authenticated
function checkAuthenticationStatus() {
  const user = getCurrentUser();
  
  if (user) {
    if (isAdmin(user)) {
      showAdminDashboard(user);
    } else {
      showServiceDashboard(user);
    }
  } else {
    showLoginScreen();
  }
}

// Show login screen
function showLoginScreen() {
  loginSection.classList.remove('hidden');
  registerSection.classList.add('hidden');
  resetPasswordSection.classList.add('hidden');
  serviceSection.classList.add('hidden');
  adminSection.classList.add('hidden');
  fullnameInput.focus();
}

// Show service dashboard
function showServiceDashboard(user) {
  // Update UI elements
  userFullnameSpan.textContent = user.fullname;
  userRegimentSpan.textContent = user.regiment;
  
  // Check if service is already active
  const status = getCurrentServiceStatus(user.fullname);
  if (status.isActive) {
    startServiceBtn.classList.add('disabled');
    endServiceBtn.classList.remove('disabled');
    serviceStatusSpan.textContent = 'En service';
    serviceStatusSpan.style.color = 'var(--success-color)';
    serviceStartSpan.textContent = formatTime(new Date(status.startTime));
    startServiceTimer(status.startTime);
  } else {
    startServiceBtn.classList.remove('disabled');
    endServiceBtn.classList.add('disabled');
    serviceStatusSpan.textContent = 'Hors service';
    serviceStatusSpan.style.color = 'var(--danger-color)';
    serviceStartSpan.textContent = '--:--:--';
    serviceEndSpan.textContent = '--:--:--';
    serviceDurationSpan.textContent = '00:00:00';
  }
  
  // Update total service hours
  totalServiceHoursSpan.textContent = calculateTotalServiceDuration(user.fullname);
  
  // Load service history
  loadUserServiceHistory(user.fullname);
  
  // Show service section
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  resetPasswordSection.classList.add('hidden');
  serviceSection.classList.remove('hidden');
  adminSection.classList.add('hidden');
}

// Show admin dashboard
function showAdminDashboard(user) {
  // Update UI elements
  adminFullnameSpan.textContent = user.fullname;
  
  // Load users for dropdown
  loadUsersForAdmin();
  
  // Show admin section
  loginSection.classList.add('hidden');
  registerSection.classList.add('hidden');
  resetPasswordSection.classList.add('hidden');
  serviceSection.classList.add('hidden');
  adminSection.classList.remove('hidden');
}

// Load user service history and display in UI
function loadUserServiceHistory(username) {
  const history = getUserServiceHistory(username);
  historyList.innerHTML = '';
  
  if (history.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'history-entry';
    emptyMessage.textContent = 'Aucun historique de service disponible';
    historyList.appendChild(emptyMessage);
    return;
  }
  
  // Sort by most recent first
  history.sort((a, b) => b.timestamp - a.timestamp);
  
  history.forEach(record => {
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.innerHTML = `
      <strong>${record.date}</strong> - 
      De ${record.startTime} à ${record.endTime} - 
      Durée: ${record.formattedDuration}
    `;
    historyList.appendChild(entry);
  });
  
  // Update total duration
  const totalDuration = calculateTotalServiceDuration(username);
  totalServiceHoursSpan.textContent = totalDuration;
}

// Load users for admin dropdown
function loadUsersForAdmin() {
  const users = getUsersForAdmin();
  userSelect.innerHTML = '';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Sélectionner un utilisateur --';
  userSelect.appendChild(defaultOption);
  
  // Add user options
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.fullname;
    option.textContent = `${user.fullname} (${user.regiment})`;
    userSelect.appendChild(option);
  });
  
  // Clear user hours display
  selectedUserSpan.textContent = '--';
  userHoursList.innerHTML = '';
  totalHoursSpan.textContent = '00:00:00';
}

// Load user hours for admin view
function loadUserHoursForAdmin(username) {
  const details = getUserServiceDetails(username);
  
  selectedUserSpan.textContent = username;
  userHoursList.innerHTML = '';
  totalHoursSpan.textContent = details.totalDuration;
  
  if (details.history.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'hours-entry';
    emptyMessage.textContent = 'Aucun historique de service disponible';
    userHoursList.appendChild(emptyMessage);
    return;
  }
  
  // Sort by most recent first
  details.history.sort((a, b) => b.timestamp - a.timestamp);
  
  details.history.forEach(record => {
    const entry = document.createElement('div');
    entry.className = 'hours-entry';
    entry.innerHTML = `
      <strong>${record.date}</strong> - 
      De ${record.startTime} à ${record.endTime} - 
      Durée: ${record.formattedDuration}
    `;
    userHoursList.appendChild(entry);
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);
