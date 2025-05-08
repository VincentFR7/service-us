/**
 * Data Service Module
 * Handles data synchronization and updates
 */

let updateInterval;

// Start data sync
function startDataSync() {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  // Update data every minute
  updateInterval = setInterval(() => {
    syncData();
  }, 60000); // 60 seconds
}

// Stop data sync
function stopDataSync() {
  if (updateInterval) {
    clearInterval(updateInterval);
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

    // Dispatch event to notify UI updates
    window.dispatchEvent(new CustomEvent('dataSync'));
  } catch (error) {
    console.error('Error syncing data:', error);
  }
}

export {
  startDataSync,
  stopDataSync,
  syncData
};