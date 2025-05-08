/**
 * Data Service Module
 * Handles data synchronization and updates
 */

let updateInterval;
const ONLINE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Start data sync
function startDataSync() {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  // Update online status
  updateOnlineStatus();

  // Update data every minute
  updateInterval = setInterval(() => {
    syncData();
    updateOnlineStatus();
  }, 60000); // 60 seconds
}

// Stop data sync
function stopDataSync() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
}

// Update online status
function updateOnlineStatus() {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    const timestamp = Date.now();
    localStorage.setItem(`lastSeen_${currentUser.fullname}`, timestamp.toString());
  } catch (error) {
    console.error('Error updating online status:', error);
  }
}

// Check if user is online
function isUserOnline(username) {
  try {
    const lastSeen = localStorage.getItem(`lastSeen_${username}`);
    if (!lastSeen) return false;

    const lastSeenTime = parseInt(lastSeen);
    return Date.now() - lastSeenTime < ONLINE_TIMEOUT;
  } catch (error) {
    console.error('Error checking online status:', error);
    return false;
  }
}

// Get all online users
function getOnlineUsers() {
  try {
    const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
    return users.filter(user => isUserOnline(user.fullname));
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
}

// Sync data
function syncData() {
  try {
    // Refresh users list
    const users = JSON.parse(localStorage.getItem('serviceUsers') || '[]');
    localStorage.setItem('serviceUsers', JSON.stringify(users));

    // Refresh service statuses
    users.forEach(user => {
      const status = localStorage.getItem(`serviceStatus_${user.fullname}`);
      if (status) {
        localStorage.setItem(`serviceStatus_${user.fullname}`, status);
      }
    });

    // Refresh announcements
    const announcements = localStorage.getItem('announcements');
    if (announcements) {
      localStorage.setItem('announcements', announcements);
    }

    // Update online status
    updateOnlineStatus();

    // Dispatch event to notify UI updates
    window.dispatchEvent(new CustomEvent('dataSync'));
  } catch (error) {
    console.error('Error syncing data:', error);
  }
}

export {
  startDataSync,
  stopDataSync,
  syncData,
  isUserOnline,
  getOnlineUsers
};