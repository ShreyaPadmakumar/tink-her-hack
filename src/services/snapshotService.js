/**
 * Snapshot Service
 * Auto-saves code snapshots when the user is in Experimenting mode.
 * Snapshots are stored in localStorage for persistence.
 */

const STORAGE_KEY = 'codebridge_snapshots';
const MAX_SNAPSHOTS = 20;

/**
 * Get all snapshots from localStorage
 * @returns {Array} Array of snapshot objects
 */
export function getSnapshots() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Save snapshots array to localStorage
 */
function saveSnapshots(snapshots) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

/**
 * Create a new code snapshot
 * @param {string} code - The code content to snapshot
 * @param {string} filename - The filename being edited
 * @param {string} language - The language/extension
 * @returns {Object} The created snapshot
 */
export function createSnapshot(code, filename, language) {
    const snapshots = getSnapshots();

    const snapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        code,
        filename: filename || 'untitled',
        language: language || 'javascript',
        timestamp: Date.now(),
        preview: code.split('\n').slice(0, 2).join('\n').substring(0, 80),
    };

    snapshots.unshift(snapshot); // newest first

    // Enforce max limit — remove oldest
    while (snapshots.length > MAX_SNAPSHOTS) {
        snapshots.pop();
    }

    saveSnapshots(snapshots);
    return snapshot;
}

/**
 * Restore a snapshot by ID
 * @param {string} id - Snapshot ID
 * @returns {Object|null} The snapshot object, or null if not found
 */
export function restoreSnapshot(id) {
    const snapshots = getSnapshots();
    return snapshots.find(s => s.id === id) || null;
}

/**
 * Delete a snapshot by ID
 * @param {string} id - Snapshot ID
 */
export function deleteSnapshot(id) {
    const snapshots = getSnapshots().filter(s => s.id !== id);
    saveSnapshots(snapshots);
}

/**
 * Clear all snapshots
 */
export function clearAllSnapshots() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Format a timestamp for display
 * @param {number} timestamp
 * @returns {string}
 */
export function formatSnapshotTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
