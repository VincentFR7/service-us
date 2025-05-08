/**
 * Game Detection Service
 * This is a simplified version that always allows service to start
 */

function getGameStatus() {
  return {
    gmod: true,
    steam: true
  };
}

// Start monitoring game status (simplified)
function startGameMonitoring() {
  // No monitoring needed
}

export {
  startGameMonitoring,
  getGameStatus
};