import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { authFetch } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);

export function CreateJoinMeeting() {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        setIsCreating(true);
        setError('');
        try {
            const res = await authFetch('/rooms', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Session' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create room');
            navigate(`/room/${data.room.roomId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setIsJoining(true);
        setError('');
        try {
            const res = await authFetch(`/rooms/${joinCode.trim().toUpperCase()}/join`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Room not found');
            navigate(`/room/${data.room.roomId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 lg:p-12">
            <div className="mb-12">
                <h1 className="text-3xl font-semibold text-text-primary mb-2 tracking-tight">Sessions</h1>
                <p className="text-text-secondary text-base">Create a new workspace or join an existing one.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                {/* create */}
                <div className="bg-panel-bg/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-text-primary">New Session</h2>
                            <p className="text-xs text-text-secondary">Start a fresh workspace</p>
                        </div>
                    </div>

                    <p className="text-sm text-text-secondary mb-6 flex-1">
                        Create a workspace with code, canvas, chat, and voice. Share the room code with your team.
                    </p>

                    <button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
                    >
                        {isCreating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                        ) : (
                            <>Create Session <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                        )}
                    </button>
                </div>

                {/* join */}
                <div className="bg-panel-bg/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-text-primary">Join Session</h2>
                            <p className="text-xs text-text-secondary">Enter with a room code</p>
                        </div>
                    </div>

                    <form onSubmit={handleJoin} className="flex-1 flex flex-col">
                        <div className="mb-6 flex-1">
                            <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                                Room Code
                            </label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={10}
                                className="w-full px-4 py-3 bg-panel-bg border border-white/5 rounded-xl text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-code text-center text-lg tracking-[0.3em]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isJoining || !joinCode.trim()}
                            className="w-full bg-white/5 text-text-primary py-3 rounded-xl font-medium hover:bg-white/10 border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isJoining ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                            ) : (
                                <>Join</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {error && (
                <div className="mt-6 max-w-3xl mx-auto p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
}

export default CreateJoinMeeting;
