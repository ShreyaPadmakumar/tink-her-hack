import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, ArrowRight, Trash2, Calendar, Users } from 'lucide-react';

export function History() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // placeholder data - will be from API later
    const sessions = [
        { id: 1, name: 'Team Standup', roomId: 'ABC123', date: '2024-01-31T10:00:00', participants: 5, duration: '45 min' },
        { id: 2, name: 'Code Review', roomId: 'DEF456', date: '2024-01-30T15:00:00', participants: 3, duration: '1h 20m' },
        { id: 3, name: 'Planning Session', roomId: 'GHI789', date: '2024-01-29T14:00:00', participants: 8, duration: '2h' },
        { id: 4, name: 'Bug Fix Sprint', roomId: 'JKL012', date: '2024-01-28T11:00:00', participants: 4, duration: '3h 15m' },
    ];

    const filtered = sessions.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roomId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;

        if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today';
        if (diff < 172800000) return 'Yesterday';

        return d.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-8 lg:p-12">
            <div className="mb-10 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-text-primary mb-2 tracking-tight">History</h1>
                    <p className="text-text-secondary text-base">Your past collaboration sessions.</p>
                </div>
            </div>

            {/* search */}
            <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sessions..."
                    className="w-full pl-10 pr-4 py-2.5 bg-panel-bg border border-white/5 rounded-xl text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all text-sm font-ui"
                />
            </div>

            <div className="space-y-1">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Clock className="w-8 h-8 text-text-faint mx-auto mb-4" />
                        <p className="text-text-secondary text-sm">
                            {searchTerm ? 'No matching sessions' : 'No sessions yet'}
                        </p>
                    </div>
                ) : (
                    filtered.map(s => (
                        <div
                            key={s.id}
                            className="group flex items-center justify-between py-4 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer border border-transparent hover:border-white/5"
                            onClick={() => navigate(`/room/${s.roomId}`)}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-text-faint group-hover:text-text-secondary transition-colors shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">{s.name}</h3>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-text-secondary font-code">{s.roomId}</span>
                                        <span className="text-text-faint">·</span>
                                        <span className="text-xs text-text-secondary">{formatDate(s.date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{s.participants}</span>
                                </div>
                                <span className="text-xs text-text-faint">{s.duration}</span>
                                <ArrowRight className="w-4 h-4 text-text-secondary" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default History;
