/**
 * Intent Detection Engine
 * Analyzes user editing patterns and classifies their current intent.
 * 
 * Intents: building, exploring, experimenting, refactoring, confused, proposing
 */

const INTENTS = {
    BUILDING: { key: 'building', emoji: '🧱', label: 'Building', color: '#3ecf71' },
    EXPLORING: { key: 'exploring', emoji: '🔍', label: 'Exploring', color: '#6e7bf2' },
    EXPERIMENTING: { key: 'experimenting', emoji: '🧪', label: 'Experimenting', color: '#f0a641' },
    REFACTORING: { key: 'refactoring', emoji: '🧹', label: 'Refactoring', color: '#9b6ef2' },
    CONFUSED: { key: 'confused', emoji: '❓', label: 'Confused', color: '#e5484d' },
    PROPOSING: { key: 'proposing', emoji: '💡', label: 'Proposing', color: '#f0a641' },
};

// Detection thresholds
const CLASSIFY_INTERVAL_MS = 3000;    // Classify every 3 seconds
const IDLE_THRESHOLD_MS = 5000;       // 5s idle = exploring
const REWRITE_RATIO_THRESHOLD = 0.6;  // >60% deletions = experimenting
const COMMENT_RATIO_THRESHOLD = 0.5;  // >50% comment chars = proposing
const UNDO_BURST_THRESHOLD = 3;       // 3+ undos in window = confused

class IntentDetector {
    constructor() {
        this._metrics = this._freshMetrics();
        this._currentIntent = INTENTS.EXPLORING;
        this._previousIntent = null;
        this._lastEditTime = Date.now();
        this._classifyTimer = null;
        this._onIntentChange = null;
        this._cursorMoveCount = 0;
        this._undoCount = 0;
    }

    /** Reset all accumulated metrics */
    _freshMetrics() {
        return {
            charsAdded: 0,
            charsDeleted: 0,
            linesAdded: 0,
            linesDeleted: 0,
            cursorMoves: 0,
            undoRedoCount: 0,
            commentCharsAdded: 0,
            totalContentChanges: 0,
            renamePatterns: 0,  // consecutive same-length replacements
        };
    }

    /** Start the periodic classification loop */
    start(onIntentChange) {
        this._onIntentChange = onIntentChange;
        this._classifyTimer = setInterval(() => {
            this._classify();
        }, CLASSIFY_INTERVAL_MS);
    }

    /** Stop the classification loop */
    stop() {
        if (this._classifyTimer) {
            clearInterval(this._classifyTimer);
            this._classifyTimer = null;
        }
        this._onIntentChange = null;
    }

    /**
     * Feed a code change event into the detector.
     * Called from CodeEditor on every onChange event.
     */
    recordChange(changeEvent) {
        this._lastEditTime = Date.now();
        const { text, rangeLength, isUndo, isRedo } = changeEvent;

        const addedLen = text ? text.length : 0;
        const deletedLen = rangeLength || 0;

        this._metrics.charsAdded += addedLen;
        this._metrics.charsDeleted += deletedLen;
        this._metrics.totalContentChanges += 1;

        // Count newlines added/removed
        if (text) {
            const newlines = (text.match(/\n/g) || []).length;
            this._metrics.linesAdded += newlines;
        }
        if (deletedLen > 0) {
            this._metrics.linesDeleted += 1; // approximate
        }

        // Check for undo/redo bursts
        if (isUndo || isRedo) {
            this._metrics.undoRedoCount += 1;
        }

        // Check for comment patterns (// or /* or # or """)
        if (text && /^\s*(\/\/|\/\*|\*|#|"""|'''|<!--)/.test(text)) {
            this._metrics.commentCharsAdded += addedLen;
        }

        // Check for rename patterns: same-length replacement (delete N, add N)
        if (deletedLen > 2 && addedLen > 2 && Math.abs(deletedLen - addedLen) <= 2) {
            this._metrics.renamePatterns += 1;
        }
    }

    /** Record a cursor-only movement (no edit) */
    recordCursorMove() {
        this._metrics.cursorMoves += 1;
    }

    /** Record an undo/redo action */
    recordUndoRedo() {
        this._metrics.undoRedoCount += 1;
    }

    /** Core classification logic */
    _classify() {
        const m = this._metrics;
        const idleTime = Date.now() - this._lastEditTime;
        const totalChars = m.charsAdded + m.charsDeleted;

        let newIntent;

        // Priority 1: Confused — lots of undo/redo with little net progress
        if (m.undoRedoCount >= UNDO_BURST_THRESHOLD) {
            newIntent = INTENTS.CONFUSED;
        }
        // Priority 2: Exploring — no edits, just moving cursor or idle
        else if (idleTime > IDLE_THRESHOLD_MS && totalChars === 0) {
            newIntent = INTENTS.EXPLORING;
        }
        // Priority 3: Proposing — mostly writing comments
        else if (
            m.commentCharsAdded > 0 &&
            totalChars > 0 &&
            m.commentCharsAdded / m.charsAdded > COMMENT_RATIO_THRESHOLD
        ) {
            newIntent = INTENTS.PROPOSING;
        }
        // Priority 4: Experimenting — high deletion ratio
        else if (
            totalChars > 10 &&
            m.charsDeleted / totalChars > REWRITE_RATIO_THRESHOLD
        ) {
            newIntent = INTENTS.EXPERIMENTING;
        }
        // Priority 5: Refactoring — rename patterns (replace same-length blocks)
        else if (m.renamePatterns >= 2) {
            newIntent = INTENTS.REFACTORING;
        }
        // Priority 6: Building — steady net additions
        else if (m.charsAdded > 10 && m.charsAdded > m.charsDeleted * 2) {
            newIntent = INTENTS.BUILDING;
        }
        // Priority 7: Exploring with cursor activity
        else if (m.cursorMoves > 3 && totalChars < 5) {
            newIntent = INTENTS.EXPLORING;
        }
        // Default: keep current or default to exploring
        else if (totalChars === 0) {
            newIntent = INTENTS.EXPLORING;
        } else {
            newIntent = this._currentIntent; // no change
        }

        // Only emit when intent actually changes
        if (newIntent.key !== this._currentIntent.key) {
            this._previousIntent = this._currentIntent;
            this._currentIntent = newIntent;
            if (this._onIntentChange) {
                this._onIntentChange(newIntent);
            }
        }

        // Reset metrics for next window
        this._metrics = this._freshMetrics();
    }

    /** Get the current detected intent */
    getCurrentIntent() {
        return this._currentIntent;
    }

    /** Get previous intent (for transition animations) */
    getPreviousIntent() {
        return this._previousIntent;
    }
}

// Singleton instance
const intentDetector = new IntentDetector();

export { INTENTS, intentDetector };
export default intentDetector;
