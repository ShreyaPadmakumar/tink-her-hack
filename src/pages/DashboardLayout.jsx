import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, Video, History, User, Settings, LogOut } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { logout, getCurrentUser } from '../services/authService';
import { disconnect as disconnectSocket } from '../services/socket';

/**
 * Dashboard Layout - Premium Linear-Style 72px Rail
 */
export function DashboardLayout() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const username = user?.username || localStorage.getItem('username') || 'User';

    const handleLogout = () => {
        disconnectSocket();
        logout();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label, end = false }) => (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 group ${isActive
                    ? 'text-text-primary bg-white/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    {/* Active Indicator Line */}
                    {isActive && (
                        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />
                    )}
                    {/* Tooltip */}
                    <div className="absolute left-14 px-2 py-1 bg-[#1A1C20] border border-white/5 text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {label}
                    </div>
                </>
            )}
        </NavLink>
    );

    return (
        <div className="min-h-screen relative overflow-hidden bg-editor-bg font-ui text-text-primary group/app">
            <AnimatedBackground />

            <div className="relative z-10 flex min-h-screen">
                {/* 72px Icon Rail */}
                <aside className="w-[72px] border-r border-white/5 bg-panel-bg/50 backdrop-blur-xl flex flex-col items-center py-6 z-50">
                    {/* Brand Icon */}
                    <div className="mb-8">
                        <div className="w-8 h-8 flex items-center justify-center bg-accent/10 border border-accent/20 rounded-lg text-accent">
                            <Code2 className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-4 w-full px-4 items-center">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" end />
                        <NavItem to="/create-join" icon={Video} label="New Session" />
                        <NavItem to="/history" icon={History} label="History" />
                    </nav>

                    {/* Bottom Actions */}
                    <div className="mt-auto flex flex-col gap-4 w-full px-4 items-center">
                        <button
                            onClick={() => { }}
                            className="flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all relative group"
                        >
                            <Settings className="w-5 h-5" strokeWidth={1.5} />
                            <div className="absolute left-14 px-2 py-1 bg-[#1A1C20] border border-white/5 text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Settings
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-all relative group"
                        >
                            <LogOut className="w-5 h-5" strokeWidth={1.5} />
                            <div className="absolute left-14 px-2 py-1 bg-[#1A1C20] border border-white/5 text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Logout
                            </div>
                        </button>

                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-medium text-text-secondary mt-2">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Minimal Header - Translucent */}
                    <header className="h-14 border-b border-white/5 bg-editor-bg/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <span className="font-medium text-text-primary">Codebridge</span>
                            <span className="text-text-faint">/</span>
                            <span>Workspace</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">System Online</span>
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto animate-fadeIn">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;
