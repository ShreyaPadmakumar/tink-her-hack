import { useNavigate } from 'react-router-dom';
import { Code2, Clock, Users, Folder, ArrowRight, Plus, Terminal } from 'lucide-react';

/**
 * Dashboard - Premium Minimalist Design
 * No cards, just typography and negative space.
 */
export function Dashboard() {
    const navigate = useNavigate();

    // Stats - displayed as text row
    const stats = [
        { label: 'Total Sessions', value: '24' },
        { label: 'Hours Coded', value: '156' },
        { label: 'Collaborators', value: '12' },
        { label: 'Projects', value: '8' },
    ];

    const recentMeetings = [
        { id: 1, name: 'Team Standup', date: 'Today, 10:00 AM', participants: 5 },
        { id: 2, name: 'Code Review Session', date: 'Yesterday, 3:00 PM', participants: 3 },
        { id: 3, name: 'Project Planning', date: 'Jan 30, 2:00 PM', participants: 8 },
    ];

    return (
        <div className="max-w-5xl mx-auto p-8 lg:p-12">
            {/* Header / Welcome */}
            <div className="mb-16">
                <h1 className="text-3xl font-semibold text-text-primary mb-2 tracking-tight">
                    Welcome back
                </h1>
                <p className="text-text-secondary text-base max-w-xl">
                    Your real-time collaboration workspace is ready.
                </p>
            </div>

            {/* Stats Row - Minimal Text Only */}
            <div className="flex flex-wrap gap-12 mb-16 border-b border-white/5 pb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col">
                        <span className="text-text-secondary text-xs uppercase tracking-wider font-medium mb-1">{stat.label}</span>
                        <span className="text-2xl font-medium text-text-primary font-code">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Column */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Recent Sessions</h2>
                        <button onClick={() => navigate('/history')} className="text-xs text-accent hover:text-accent-hover transition-colors">View all</button>
                    </div>

                    <div className="space-y-1">
                        {recentMeetings.map((meeting) => (
                            <div
                                key={meeting.id}
                                className="group flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/5 text-text-tertiary group-hover:text-text-primary transition-colors">
                                        <Code2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{meeting.name}</h3>
                                        <p className="text-xs text-text-secondary">{meeting.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{meeting.participants}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-text-secondary" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Column - Quick Actions */}
                <div>
                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-6">Quick Actions</h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/create-join')}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group text-left"
                        >
                            <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-text-primary">New Session</div>
                                <div className="text-[11px] text-text-secondary">Create a fresh workspace</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/create-join')}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group text-left"
                        >
                            <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-text-secondary group-hover:text-text-primary transition-colors">
                                <Terminal className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-text-primary">Join Session</div>
                                <div className="text-[11px] text-text-secondary">Enter with room code</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
