/**
 * Announcement Service Module
 * Handles announcements and confidential information management
 */

// Get encryption key
function getEncryptionKey() {
  return 'military-announcements-2025';
}

// Encrypt data
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

// Get announcements from storage
function getAnnouncements() {
  try {
    const key = getEncryptionKey();
    const encryptedData = localStorage.getItem('announcements');
    if (!encryptedData) return [];
    
    const decryptedData = decryptData(encryptedData, key);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error getting announcements:', error);
    return [];
  }
}

// Save announcement
function saveAnnouncement(title, content, isConfidential = false, author) {
  try {
    if (!title || !content || !author) {
      throw new Error('Tous les champs sont requis');
    }

    const announcements = getAnnouncements();
    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      isConfidential,
      author,
      timestamp: new Date().toISOString()
    };
    
    announcements.push(newAnnouncement);
    
    const key = getEncryptionKey();
    const encryptedData = encryptData(JSON.stringify(announcements), key);
    localStorage.setItem('announcements', encryptedData);
    
    return { success: true, announcement: newAnnouncement };
  } catch (error) {
    console.error('Error saving announcement:', error);
    return { success: false, message: error.message || 'Erreur lors de l\'enregistrement de l\'annonce' };
  }
}

// Delete announcement
function deleteAnnouncement(id) {
  try {
    const announcements = getAnnouncements();
    const filteredAnnouncements = announcements.filter(a => a.id !== id);
    
    const key = getEncryptionKey();
    const encryptedData = encryptData(JSON.stringify(filteredAnnouncements), key);
    localStorage.setItem('announcements', encryptedData);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, message: 'Erreur lors de la suppression de l\'annonce' };
  }
}

// Update announcement
function updateAnnouncement(id, title, content, isConfidential) {
  try {
    const announcements = getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    
    if (index === -1) {
      return { success: false, message: 'Annonce non trouvée' };
    }
    
    announcements[index] = {
      ...announcements[index],
      title,
      content,
      isConfidential,
      lastModified: new Date().toISOString()
    };
    
    const key = getEncryptionKey();
    const encryptedData = encryptData(JSON.stringify(announcements), key);
    localStorage.setItem('announcements', encryptedData);
    
    return { success: true, announcement: announcements[index] };
  } catch (error) {
    console.error('Error updating announcement:', error);
    return { success: false, message: 'Erreur lors de la mise à jour de l\'annonce' };
  }
}

export {
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  updateAnnouncement
};