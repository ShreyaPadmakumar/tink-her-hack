// uses piston API for code execution (free, no key needed)
// https://github.com/engineer-man/piston

import axios from 'axios';

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANG_MAP = {
    python: { language: 'python', version: '3.10.0' },
    javascript: { language: 'javascript', version: '18.15.0' },
    cpp: { language: 'cpp', version: '10.2.0' },
    java: { language: 'java', version: '15.0.2' },
    c: { language: 'c', version: '10.2.0' }
};

const FILE_NAMES = {
    python: 'main.py',
    javascript: 'main.js',
    cpp: 'main.cpp',
    java: 'Main.java',
    c: 'main.c'
};

class CodeExecutionService {
    constructor() {
        this.isExecuting = false;
    }

    async executeCode(code, language = 'python', stdin = '') {
        if (!code?.trim()) {
            return {
                success: false, output: '', error: 'No code to execute.',
                executionTime: 0, language
            };
        }

        const config = LANG_MAP[language];
        if (!config) {
            return {
                success: false, output: '',
                error: `Unsupported language: ${language}`,
                executionTime: 0, language
            };
        }

        this.isExecuting = true;
        const t0 = Date.now();

        try {
            const resp = await axios.post(PISTON_URL, {
                language: config.language,
                version: config.version,
                files: [{ name: FILE_NAMES[language] || 'main.txt', content: code }],
                stdin,
                args: [],
                compile_timeout: 10000,
                run_timeout: 5000,
                compile_memory_limit: -1,
                run_memory_limit: -1
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            const elapsed = Date.now() - t0;
            const result = resp.data;

            // compile error?
            if (result.compile && result.compile.code !== 0) {
                return {
                    success: false, output: '',
                    error: result.compile.stderr || result.compile.output || 'Compilation failed',
                    executionTime: elapsed, language, stage: 'compile'
                };
            }

            if (result.run) {
                const hasErr = result.run.code !== 0 || result.run.stderr;
                const output = result.run.stdout || result.run.output || '';
                const stderr = result.run.stderr || '';

                return {
                    success: !hasErr || output.length > 0,
                    output, error: stderr,
                    executionTime: elapsed, language,
                    exitCode: result.run.code, stage: 'run'
                };
            }

            return {
                success: false, output: '', error: 'Unknown execution error',
                executionTime: elapsed, language
            };

        } catch (err) {
            const elapsed = Date.now() - t0;

            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                return {
                    success: false, output: '',
                    error: 'Execution timed out. Your code may have an infinite loop or is taking too long.',
                    executionTime: elapsed, language
                };
            }

            if (err.response) {
                return {
                    success: false, output: '',
                    error: `Server error: ${err.response.status} - ${err.response.statusText}`,
                    executionTime: elapsed, language
                };
            }

            if (err.request) {
                return {
                    success: false, output: '',
                    error: 'Network error. Check your connection and try again.',
                    executionTime: elapsed, language
                };
            }

            return {
                success: false, output: '',
                error: `Execution error: ${err.message}`,
                executionTime: elapsed, language
            };
        } finally {
            this.isExecuting = false;
        }
    }

    getSupportedLanguages() {
        return Object.keys(LANG_MAP);
    }

    isLanguageSupported(lang) {
        return lang in LANG_MAP;
    }
}

export const codeExecutionService = new CodeExecutionService();
export default codeExecutionService;
