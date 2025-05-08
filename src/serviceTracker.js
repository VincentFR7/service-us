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

// Check if Garry's Mod is running
let lastGameStatus = false;
let gameCheckInterval;

async function isGModRunning() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('http://localhost:27015/info', {
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);
    const isRunning = response.ok;
    
    if (lastGameStatus && !isRunning) {
      const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
      users.forEach(user => {
        const status = getCurrentServiceStatus(user.fullname);
        if (status.isActive) {
          endService(user.fullname);
          alert(`Service terminé automatiquement pour ${user.fullname}: Garry's Mod n'est plus en cours d'exécution`);
        }
      });
    }
    
    lastGameStatus = isRunning;
    return isRunning;
  } catch (error) {
    console.error('Error checking Garry\'s Mod status:', error);
    
    let errorMessage = 'Impossible de vérifier le statut de Garry\'s Mod: ';
    
    if (error.name === 'AbortError') {
      errorMessage += 'Le serveur ne répond pas (timeout).';
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage += 'Le serveur n\'est pas accessible. Vérifiez que Garry\'s Mod est en cours d\'exécution.';
    } else {
      errorMessage += error.message;
    }
    
    throw new Error(errorMessage);
  }
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

// Decrypt stored data
function decryptData(encryptedData, key) {
  return atob(encryptedData)
    .split('')
    .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

// Get encryption key
function getEncryptionKey() {
  return 'military-service-tracker-2025';
}

// Get user's service history
function getUserServiceHistory(username) {
  const key = getEncryptionKey();
  const encryptedHistory = localStorage.getItem(`serviceHistory_${username}`);
  if (!encryptedHistory) return [];
  
  try {
    const decryptedHistory = decryptData(encryptedHistory, key);
    return JSON.parse(decryptedHistory);
  } catch {
    return [];
  }
}

// Add service record to user's history
function addServiceRecord(username, startTime, endTime) {
  const key = getEncryptionKey();
  const history = getUserServiceHistory(username);
  const duration = calculateDuration(startTime, endTime);
  
  const record = {
    date: formatDate(new Date(startTime)),
    startTime: formatTime(new Date(startTime)),
    endTime: formatTime(new Date(endTime)),
    duration: duration,
    formattedDuration: formatDuration(duration),
    timestamp: new Date().getTime()
  };
  
  history.push(record);
  
  // Encrypt and save history
  const encryptedHistory = encryptData(JSON.stringify(history), key);
  localStorage.setItem(`serviceHistory_${username}`, encryptedHistory);
  
  // Backup to IndexedDB
  backupToIndexedDB(username, history);
  
  return record;
}

// Backup data to IndexedDB
async function backupToIndexedDB(username, data) {
  try {
    const db = await openDB();
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    await store.put({ id: username, data, timestamp: Date.now() });
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
    };
  });
}

// Reset user's service history
function resetUserServiceHistory(username) {
  localStorage.removeItem(`serviceHistory_${username}`);
}

// Reset all users' service history
function resetAllServiceHistory() {
  const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
  users.forEach(user => {
    resetUserServiceHistory(user.fullname);
  });
}

// Calculate total service duration for a user
function calculateTotalServiceDuration(username) {
  const history = getUserServiceHistory(username);
  const totalSeconds = history.reduce((total, record) => total + record.duration, 0);
  return formatDuration(totalSeconds);
}

// Get current service status
function getCurrentServiceStatus(username) {
  const key = getEncryptionKey();
  const encryptedStatus = localStorage.getItem(`serviceStatus_${username}`);
  
  if (!encryptedStatus) {
    return { isActive: false, startTime: null };
  }
  
  try {
    const decryptedStatus = decryptData(encryptedStatus, key);
    return JSON.parse(decryptedStatus);
  } catch {
    return { isActive: false, startTime: null };
  }
}

// Start service for a user
async function startService(username) {
  try {
    const gmodRunning = await isGModRunning();
    if (!gmodRunning) {
      throw new Error('Vous devez avoir Garry\'s Mod ouvert pour prendre votre service.');
    }

    const now = new Date().getTime();
    const status = { isActive: true, startTime: now };
    
    // Encrypt and save status
    const key = getEncryptionKey();
    const encryptedStatus = encryptData(JSON.stringify(status), key);
    localStorage.setItem(`serviceStatus_${username}`, encryptedStatus);
    
    // Start monitoring Garry's Mod
    startGModMonitoring(username);
    
    return status;
  } catch (error) {
    // Re-throw the error with the detailed message from isGModRunning
    throw error;
  }
}

// End service for a user
function endService(username) {
  const status = getCurrentServiceStatus(username);
  if (!status.isActive) return null;
  
  const now = new Date().getTime();
  const record = addServiceRecord(username, status.startTime, now);
  
  // Reset the status
  const key = getEncryptionKey();
  const newStatus = { isActive: false, startTime: null };
  const encryptedStatus = encryptData(JSON.stringify(newStatus), key);
  localStorage.setItem(`serviceStatus_${username}`, encryptedStatus);
  
  // Stop monitoring
  stopGModMonitoring();
  
  return record;
}

// Monitor Garry's Mod status
function startGModMonitoring(username) {
  stopGModMonitoring();
  
  gameCheckInterval = setInterval(async () => {
    try {
      const gmodRunning = await isGModRunning();
      if (!gmodRunning) {
        const status = getCurrentServiceStatus(username);
        if (status.isActive) {
          endService(username);
          alert('Service terminé automatiquement : Garry\'s Mod n\'est plus en cours d\'exécution');
        }
      }
    } catch (error) {
      console.error('Error in Garry\'s Mod monitoring:', error);
      // Don't end service on monitoring errors to prevent false positives
    }
  }, 30000); // Check every 30 seconds
}

function stopGModMonitoring() {
  if (gameCheckInterval) {
    clearInterval(gameCheckInterval);
    gameCheckInterval = null;
  }
}

export {
  formatTime,
  formatDate,
  formatDuration,
  calculateDuration,
  getUserServiceHistory,
  addServiceRecord,
  resetUserServiceHistory,
  resetAllServiceHistory,
  calculateTotalServiceDuration,
  getCurrentServiceStatus,
  startService,
  endService,
  isGModRunning
};
