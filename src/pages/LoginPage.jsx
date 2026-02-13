import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GoogleLogo } from '../components/GoogleLogo';
import { login, register } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);

export function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [step, setStep] = useState('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('checking');

    // check backend on mount
    useEffect(() => {
        fetch(`${API_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(5000) })
            .then(r => setServerStatus(r.ok ? 'online' : 'offline'))
            .catch(() => setServerStatus('offline'));
    }, []);

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (serverStatus === 'offline') {
            setError('Server is offline. Please start the backend server first.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                setStep('username');
            } else {
                await login(email, password);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        setError('Google OAuth requires API key setup. Please use email login.');
    };

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await register(email, password, username);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const ServerStatusBadge = () => (
        <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase border mb-6 transition-colors duration-300
            ${serverStatus === 'online'
                ? 'bg-success/10 text-success border-success/20'
                : serverStatus === 'offline'
                    ? 'bg-error/10 text-error border-error/20'
                    : 'bg-warning/10 text-warning border-warning/20'
            }
        `}>
            {serverStatus === 'online' ? (
                <><div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> ONLINE</>
            ) : serverStatus === 'offline' ? (
                <><AlertCircle className="w-3 h-3" /> OFFLINE</>
            ) : (
                <><span className="w-3 h-3 animate-spin">⟳</span> CHECKING</>
            )}
        </div>
    );

    const inputClasses = "w-full pl-10 pr-4 py-3 bg-panel-bg border border-white/5 rounded-xl text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-ui text-[15px]";
    const labelClasses = "block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide";
    const iconClasses = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint group-focus-within:text-accent transition-colors";

    // username step
    if (step === 'username') {
        return (
            <div className="min-h-screen relative overflow-hidden bg-editor-bg font-ui flex flex-col items-center justify-center p-6">
                <AnimatedBackground />

                <div className="relative z-10 w-full max-w-[400px] animate-fadeIn">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl mb-6 shadow-lg shadow-accent/10">
                            <User className="w-6 h-6 text-accent" strokeWidth={2} />
                        </div>
                        <h1 className="text-2xl font-semibold text-text-primary mb-2 tracking-tight">Set Username</h1>
                        <p className="text-text-secondary text-sm">How others will see you.</p>
                    </div>

                    <div className="bg-panel-bg/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                        {error && (
                            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleUsernameSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className={labelClasses}>Username</label>
                                <div className="relative group">
                                    <User className={iconClasses} />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        required
                                        minLength={3}
                                        maxLength={20}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !username.trim() || username.length < 3}
                                className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? 'Creating...' : 'Create Account'}
                                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('auth'); setError(''); }}
                                className="w-full text-text-secondary hover:text-text-primary py-2 text-sm transition-colors"
                            >
                                ← Back
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-editor-bg font-ui flex flex-col items-center justify-center p-6">
            <AnimatedBackground />

            <div className="relative z-10 w-full max-w-[400px] animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-xl mb-6 shadow-lg shadow-indigo-500/10">
                        <Code2 className="w-6 h-6 text-text-primary" strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Codebridge</h1>
                    <p className="text-text-secondary text-[15px]">Real-time collaborative workspace.</p>
                </div>

                <div className="bg-panel-bg/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1 shadow-2xl">
                    <div className="p-5">
                        <div className="flex justify-center"><ServerStatusBadge /></div>

                        <div className="grid grid-cols-2 gap-1 p-1 bg-black/20 rounded-xl mb-6">
                            <button
                                onClick={() => { setMode('login'); setError(''); }}
                                className={`py-2 rounded-lg text-xs font-medium transition-all duration-200 ${mode === 'login'
                                    ? 'bg-white/10 text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => { setMode('signup'); setError(''); }}
                                className={`py-2 rounded-lg text-xs font-medium transition-all duration-200 ${mode === 'signup'
                                    ? 'bg-white/10 text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div>
                                <label htmlFor="email" className={labelClasses}>Email</label>
                                <div className="relative group">
                                    <Mail className={iconClasses} />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@work.com"
                                        required
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={labelClasses}>Password</label>
                                <div className="relative group">
                                    <Lock className={iconClasses} />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || serverStatus === 'offline'}
                                className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wide">
                                <span className="px-2 bg-[#121214] text-text-faint">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/5 text-text-secondary py-3 rounded-xl font-medium hover:bg-white/10 hover:text-text-primary transition-all text-sm"
                        >
                            <GoogleLogo className="w-4 h-4" />
                            Google
                        </button>
                    </div>
                </div>

                {mode === 'login' && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setError('Contact administrator for reset.')}
                            className="text-xs text-text-secondary hover:text-accent transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginPage;
