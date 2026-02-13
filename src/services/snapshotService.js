// auto-saves code snapshots when user is in experimenting mode
// stored in localStorage

const STORAGE_KEY = 'codebridge_snapshots';
const MAX_SNAPSHOTS = 20;

export function getSnapshots() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveSnapshots(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function createSnapshot(code, filename, language) {
    const list = getSnapshots();

    const snap = {
        id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        code,
        filename: filename || 'untitled',
        language: language || 'javascript',
        timestamp: Date.now(),
        preview: code.split('\n').slice(0, 2).join('\n').substring(0, 80),
    };

    list.unshift(snap);

    // cap at max
    while (list.length > MAX_SNAPSHOTS) list.pop();

    saveSnapshots(list);
    return snap;
}

export function restoreSnapshot(id) {
    return getSnapshots().find(s => s.id === id) || null;
}

export function deleteSnapshot(id) {
    saveSnapshots(getSnapshots().filter(s => s.id !== id));
}

export function clearAllSnapshots() {
    localStorage.removeItem(STORAGE_KEY);
}

export function formatSnapshotTime(ts) {
    const date = new Date(ts);
    const diffMs = Date.now() - date;
    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}
