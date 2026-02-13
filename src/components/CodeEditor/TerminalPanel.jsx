import { useState, useRef, useEffect } from 'react';
import {
    Terminal,
    Trash2,
    ChevronUp,
    ChevronDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Send,
    Play
} from 'lucide-react';

export default function TerminalPanel({
    isExecuting = false,
    terminalHistory = [],
    onClear = () => { },
    currentFilename = 'main.py',
    stdin = '',
    onStdinChange = () => { },
    onExecuteWithStdin = () => { }
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showStdin, setShowStdin] = useState(false);
    const outputRef = useRef(null);

    // Auto-scroll to bottom when new output added
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [terminalHistory, isExecuting]);

    // Format execution time
    const formatTime = (ms) => {
        if (!ms && ms !== 0) return '0ms';
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <div className={`bg-[#111113] rounded-xl border border-[#222225] flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? 'h-full' : 'h-12'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#141416] border-b border-[#222225]">
                <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-[#7a7a80]" />
                    <span className="text-sm font-medium text-[#ededef]">Terminal</span>
                    <span className="text-xs text-[#4e4e56]">
                        {terminalHistory.length} execution{terminalHistory.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Running indicator */}
                    {isExecuting && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#f0a641]/20 text-[#f0a641]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Running
                        </span>
                    )}

                    {/* Clear Button */}
                    <button
                        onClick={onClear}
                        className="p-1.5 hover:bg-[#222225] rounded transition-colors"
                        title="Clear terminal (Ctrl+L)"
                    >
                        <Trash2 className="w-4 h-4 text-[#4e4e56] hover:text-[#7a7a80]" />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-[#222225] rounded transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#4e4e56] hover:text-[#7a7a80]" />
                        ) : (
                            <ChevronUp className="w-4 h-4 text-[#4e4e56] hover:text-[#7a7a80]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <>
                    {/* Stdin Input Section */}
                    <div className="px-4 py-2 bg-[#141416] border-b border-[#222225]">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowStdin(!showStdin)}
                                className={`text-xs px-2 py-1 rounded transition-colors ${showStdin
                                        ? 'bg-[#6e7bf2]/20 text-[#6e7bf2]'
                                        : 'bg-[#222225] text-[#4e4e56] hover:text-[#7a7a80]'
                                    }`}
                            >
                                stdin
                            </button>
                            {showStdin && (
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={stdin}
                                        onChange={(e) => onStdinChange(e.target.value)}
                                        placeholder="Enter program input..."
                                        className="flex-1 px-3 py-1.5 bg-[#1a1a1e] border border-[#222225] rounded text-sm text-[#ededef] placeholder-[#4e4e56] focus:outline-none focus:border-[#6e7bf2]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !isExecuting) {
                                                onExecuteWithStdin();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={onExecuteWithStdin}
                                        disabled={isExecuting}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 rounded text-xs text-white font-medium transition-colors"
                                    >
                                        <Play className="w-3 h-3" />
                                        Run
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terminal Output - Scrollable History */}
                    <div
                        ref={outputRef}
                        className="flex-1 p-4 overflow-auto font-mono text-sm"
                    >
                        {terminalHistory.length === 0 && !isExecuting ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <Terminal className="w-10 h-10 text-[#222225] mb-3" />
                                <p className="text-sm text-[#4e4e56]">
                                    Click <span className="text-[#22c55e] font-medium">Run</span> or press{' '}
                                    <kbd className="px-1.5 py-0.5 bg-[#222225] rounded text-[#7a7a80]">Ctrl</kbd>+
                                    <kbd className="px-1.5 py-0.5 bg-[#222225] rounded text-[#7a7a80]">Enter</kbd>
                                </p>
                                <p className="text-xs text-[#2a2a30] mt-1">
                                    Output history will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {/* History entries */}
                                {terminalHistory.map((entry, index) => (
                                    <div key={entry.id} className="mb-4">
                                        {/* Command header */}
                                        <div className="flex items-center gap-2 text-xs mb-1">
                                            <span className="text-[#22c55e] font-bold">❯</span>
                                            <span className="text-[#60a5fa]">Running {entry.filename}</span>
                                            <span className="ml-auto text-[#4e4e56]">{entry.timestamp}</span>
                                        </div>

                                        {/* Output */}
                                        {entry.output && (
                                            <pre className="text-[#ededef] bg-[#0d0d0d] rounded p-3 mb-2 whitespace-pre-wrap break-words overflow-x-auto">
                                                {entry.output}
                                            </pre>
                                        )}

                                        {/* Error */}
                                        {entry.error && (
                                            <pre className="text-[#e5484d] bg-[#e5484d]/10 border-l-2 border-[#e5484d] rounded p-3 mb-2 whitespace-pre-wrap break-words">
                                                {entry.error}
                                            </pre>
                                        )}

                                        {/* Exit status */}
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className={`flex items-center gap-1 ${entry.exitCode === 0 ? 'text-[#3ecf71]' : 'text-[#e5484d]'
                                                }`}>
                                                {entry.exitCode === 0 ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : (
                                                    <AlertCircle className="w-3 h-3" />
                                                )}
                                                Exit code: {entry.exitCode ?? 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-[#4e4e56]">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(entry.executionTime)}
                                            </span>
                                        </div>

                                        {/* Separator */}
                                        {index < terminalHistory.length - 1 && (
                                            <div className="border-t border-[#222225] mt-4" />
                                        )}
                                    </div>
                                ))}

                                {/* Currently executing */}
                                {isExecuting && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 text-xs mb-2">
                                            <span className="text-[#f0a641] font-bold">❯</span>
                                            <span className="text-[#60a5fa]">Running {currentFilename}...</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#7a7a80] p-3 bg-[#0d0d0d] rounded">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#f0a641]" />
                                            <span>Executing code...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
