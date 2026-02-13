import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, Video, Terminal } from 'lucide-react';
import { authFetch, getCurrentUser } from '../services/authService';

/**
 * Create/Join - Minimalist Forms
 */
export function CreateJoinMeeting() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const [mode, setMode] = useState('create');
    const [meetingCode, setMeetingCode] = useState('');
    const [meetingName, setMeetingName] = useState('');
    const [displayName, setDisplayName] = useState(currentUser?.username || localStorage.getItem('username') || '');
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAction = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) return setError('Display name required');

        setIsLoading(true);
        setError('');

        try {
            if (mode === 'create') {
                const res = await authFetch('/rooms', { method: 'POST', body: JSON.stringify({ name: meetingName }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed');

                localStorage.setItem('displayName', displayName.trim());
                navigate(`/room/${data.room.roomId || data.room._id}`);
            } else {
                const code = meetingCode.trim().toUpperCase(); // Keep uppercase for consistency

                // Use authFetch if not guest, otherwise regular fetch
                let res;
                if (isGuest) {
                    const apiUrl = import.meta.env.VITE_API_URL ||
                        (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);
                    res = await fetch(`${apiUrl}/rooms/${code}/join`, { method: 'POST' });
                } else {
                    res = await authFetch(`/rooms/${code}/join`, { method: 'POST' });
                }

                if (!res.ok) {
                    if (res.status === 404) throw new Error('Room not found');
                    throw new Error('Invalid code or connection failed');
                }

                localStorage.setItem('displayName', displayName.trim());
                navigate(`/room/${code}${isGuest ? '?guest=true' : ''}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-text-primary text-sm placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-ui";
    const labelClasses = "block text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-2";

    return (
        <div className="max-w-xl mx-auto p-8 lg:p-16 flex flex-col justify-center min-h-[80vh]">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl text-text-primary mb-4 border border-white/5">
                    {mode === 'create' ? <Video className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                </div>
                <h1 className="text-2xl font-semibold text-text-primary mb-2">
                    {mode === 'create' ? 'Start a Session' : 'Join Workspace'}
                </h1>
                <p className="text-text-secondary text-sm">
                    {mode === 'create' ? 'Create a new collaborative environment.' : 'Enter your team\'s code to connect.'}
                </p>
            </div>

            <div className="bg-panel-bg border border-white/5 rounded-xl p-1 mb-8 flex">
                <button
                    onClick={() => setMode('create')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'create' ? 'bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Create New
                </button>
                <button
                    onClick={() => setMode('join')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'join' ? 'bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Join Existing
                </button>
            </div>

            <div className="bg-panel-bg/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
                {error && <div className="mb-6 text-xs text-error bg-error/10 px-3 py-2 rounded-md border border-error/20">{error}</div>}

                <form onSubmit={handleAction} className="space-y-6">
                    <div>
                        <label className={labelClasses}>Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className={inputClasses}
                            required
                        />
                    </div>

                    {mode === 'create' ? (
                        <div>
                            <label className={labelClasses}>Session Name (Optional)</label>
                            <input
                                type="text"
                                value={meetingName}
                                onChange={(e) => setMeetingName(e.target.value)}
                                placeholder="e.g. Weekly Sync"
                                className={inputClasses}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className={labelClasses}>Workspace Code</label>
                            <input
                                type="text"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                                placeholder="ABC-123"
                                className={`${inputClasses} font-mono tracking-widest text-center`}
                                required
                            />
                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="guestMode"
                                    checked={isGuest}
                                    onChange={(e) => setIsGuest(e.target.checked)}
                                    className="rounded bg-white/5 border-white/10 text-accent focus:ring-accent/50"
                                />
                                <label htmlFor="guestMode" className="text-sm text-text-secondary cursor-pointer select-none">
                                    Join as Guest (ignore login)
                                </label>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/10 group"
                    >
                        {isLoading ? 'Processing...' : (mode === 'create' ? 'Launch Workspace' : 'Connect')}
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateJoinMeeting;
