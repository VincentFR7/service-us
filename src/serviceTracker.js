/**
 * Service Tracker Module
 * Handles tracking service hours, calculating durations, and managing service history
 */

// Format time as HH:MM:SS
function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

// Format date as DD/MM/YYYY
function formatDate(date) {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Calculate duration between two timestamps in seconds
function calculateDuration(startTime, endTime) {
  return Math.floor((endTime - startTime) / 1000);
}

// Format duration in seconds to HH:MM:SS
function formatDuration(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

// Get encryption key
function getEncryptionKey() {
  return 'military-service-tracker-2025';
}

// Encrypt data before storing
function encryptData(data, key) {
  return btoa(
    String.fromCharCode.apply(
      null,
      Array.from(data).map((char, i) => char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    )
  );
}

// Decrypt data
function decryptData(encryptedData, key) {
  return atob(encryptedData)
    .split('')
    .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

// Get user service history
function getUserServiceHistory(username) {
  try {
    const key = getEncryptionKey();
    const encryptedData = localStorage.getItem(`serviceHistory_${username}`);
    if (!encryptedData) return [];
    
    const decryptedData = decryptData(encryptedData, key);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error getting service history:', error);
    return [];
  }
}

// Save service record
function saveServiceRecord(username, record) {
  try {
    const history = getUserServiceHistory(username);
    history.push(record);
    
    const key = getEncryptionKey();
    const encryptedData = encryptData(JSON.stringify(history), key);
    localStorage.setItem(`serviceHistory_${username}`, encryptedData);
    
    return true;
  } catch (error) {
    console.error('Error saving service record:', error);
    return false;
  }
}

// Get current service status
function getCurrentServiceStatus(username) {
  try {
    const key = getEncryptionKey();
    const encryptedData = localStorage.getItem(`serviceStatus_${username}`);
    if (!encryptedData) return { isActive: false };
    
    const decryptedData = decryptData(encryptedData, key);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error getting service status:', error);
    return { isActive: false };
  }
}

// Start service
function startService(username) {
  const startTime = new Date().getTime();
  const status = {
    isActive: true,
    startTime
  };
  
  try {
    const key = getEncryptionKey();
    const encryptedData = encryptData(JSON.stringify(status), key);
    localStorage.setItem(`serviceStatus_${username}`, encryptedData);
    return status;
  } catch (error) {
    console.error('Error starting service:', error);
    throw new Error('Erreur lors du démarrage du service');
  }
}

// End service
function endService(username) {
  const status = getCurrentServiceStatus(username);
  if (!status.isActive) return null;
  
  const endTime = new Date().getTime();
  const durationInSeconds = calculateDuration(status.startTime, endTime);
  
  const record = {
    startTime: status.startTime,
    endTime,
    date: formatDate(new Date()),
    timestamp: endTime,
    formattedDuration: formatDuration(durationInSeconds)
  };
  
  // Save record and clear status
  if (saveServiceRecord(username, record)) {
    localStorage.removeItem(`serviceStatus_${username}`);
    return record;
  }
  
  return null;
}

// Reset user service history
function resetUserServiceHistory(username) {
  localStorage.removeItem(`serviceHistory_${username}`);
  localStorage.removeItem(`serviceStatus_${username}`);
}

// Reset all service history
function resetAllServiceHistory() {
  const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
  users.forEach(user => {
    resetUserServiceHistory(user.fullname);
  });
}

// Calculate total service duration
function calculateTotalServiceDuration(username) {
  const history = getUserServiceHistory(username);
  let totalSeconds = 0;
  
  history.forEach(record => {
    const duration = calculateDuration(record.startTime, record.endTime);
    totalSeconds += duration;
  });
  
  return formatDuration(totalSeconds);
}

export {
  formatTime,
  formatDuration,
  getUserServiceHistory,
  calculateTotalServiceDuration,
  getCurrentServiceStatus,
  startService,
  endService,
  resetUserServiceHistory,
  resetAllServiceHistory
};