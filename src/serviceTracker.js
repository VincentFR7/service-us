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

// Get user's service history
function getUserServiceHistory(username) {
  const serviceHistoryJson = localStorage.getItem(`serviceHistory_${username}`);
  return serviceHistoryJson ? JSON.parse(serviceHistoryJson) : [];
}

// Add service record to user's history
function addServiceRecord(username, startTime, endTime) {
  const history = getUserServiceHistory(username);
  const duration = calculateDuration(startTime, endTime);
  
  const record = {
    date: formatDate(new Date(startTime)),
    startTime: formatTime(new Date(startTime)),
    endTime: formatTime(new Date(endTime)),
    duration: duration,
    formattedDuration: formatDuration(duration),
    timestamp: new Date().getTime() // For sorting
  };
  
  history.push(record);
  localStorage.setItem(`serviceHistory_${username}`, JSON.stringify(history));
  
  return record;
}

// Reset user's service history
function resetUserServiceHistory(username) {
  localStorage.removeItem(`serviceHistory_${username}`);
}

// Calculate total service duration for a user
function calculateTotalServiceDuration(username) {
  const history = getUserServiceHistory(username);
  const totalSeconds = history.reduce((total, record) => total + record.duration, 0);
  return formatDuration(totalSeconds);
}

// Get current service status
function getCurrentServiceStatus(username) {
  const statusJson = localStorage.getItem(`serviceStatus_${username}`);
  return statusJson ? JSON.parse(statusJson) : { isActive: false, startTime: null };
}

// Start service for a user
function startService(username) {
  const now = new Date().getTime();
  const status = { isActive: true, startTime: now };
  localStorage.setItem(`serviceStatus_${username}`, JSON.stringify(status));
  return status;
}

// End service for a user
function endService(username) {
  const status = getCurrentServiceStatus(username);
  if (!status.isActive) return null;
  
  const now = new Date().getTime();
  const record = addServiceRecord(username, status.startTime, now);
  
  // Reset the status
  localStorage.setItem(`serviceStatus_${username}`, JSON.stringify({ 
    isActive: false, 
    startTime: null 
  }));
  
  return record;
}

export {
  formatTime,
  formatDate,
  formatDuration,
  calculateDuration,
  getUserServiceHistory,
  addServiceRecord,
  resetUserServiceHistory,
  calculateTotalServiceDuration,
  getCurrentServiceStatus,
  startService,
  endService
};