import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Clock, Users, ArrowRight, MoreHorizontal } from 'lucide-react';
import { authFetch } from '../services/authService';

/**
 * History Page - Timeline View
 */
export function History() {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Placeholder data
    const placeholderMeetings = [
        { id: 1, name: 'React Component Development', date: 'Today', time: '10:00 AM', duration: '2h 15m', participants: 5, roomId: 'abc123' },
        { id: 2, name: 'Backend API Review', date: 'Yesterday', time: '3:00 PM', duration: '1h 30m', participants: 3, roomId: 'def456' },
        { id: 3, name: 'Project Planning', date: 'Jan 30', time: '2:00 PM', duration: '3h 00m', participants: 8, roomId: 'ghi789' },
        { id: 4, name: 'Bug Fix Session', date: 'Jan 29', time: '11:00 AM', duration: '45m', participants: 2, roomId: 'jkl012' },
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await authFetch('/users/rooms');
                if (response.ok) {
                    const data = await response.json();
                    setMeetings(data.rooms || data || []);
                } else {
                    setMeetings(placeholderMeetings);
                }
            } catch (err) {
                setMeetings(placeholderMeetings);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleRejoin = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <div className="mb-12 flex items-baseline justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary mb-2">Session History</h1>
                    <p className="text-text-secondary text-sm">Timeline of your collaboration contributions.</p>
                </div>

                {/* Minimal Filter Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    {['all', 'week', 'month'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${filter === f
                                ? 'bg-panel-bg text-text-primary shadow-sm border border-white/5'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-lg w-full" />)}
                </div>
            ) : (
                <div className="relative border-l border-white/10 ml-3 space-y-8 pl-8 py-2">
                    {/* Timeline Items */}
                    {(meetings.length > 0 ? meetings : placeholderMeetings).map((meeting, idx) => (
                        <div key={meeting.id || idx} className="relative group">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-editor-bg border border-white/10 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary group-hover:bg-accent transition-colors" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono text-text-secondary">{meeting.date || 'Unknown'} • {meeting.time || '00:00'}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-xs text-text-tertiary">{meeting.duration}</span>
                                    </div>
                                    <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-colors cursor-pointer" onClick={() => handleRejoin(meeting.roomId)}>
                                        {meeting.name || 'Untitled Session'}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(3, meeting.participants || 1))].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-panel-bg border border-white/10 flex items-center justify-center text-[10px] text-text-secondary">
                                                <Users className="w-3 h-3" />
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleRejoin(meeting.roomId)}
                                        className="text-xs font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-1"
                                    >
                                        Open <ArrowRight className="w-3 h-3" />
                                    </button>

                                    <button className="text-text-secondary hover:text-text-primary">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;
