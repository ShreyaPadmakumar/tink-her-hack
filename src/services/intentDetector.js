/*
 * Intent detection - analyzes editing patterns to figure out what the user is doing
 * intents: building, exploring, experimenting, refactoring, confused, proposing
 */

const INTENTS = {
    BUILDING: { key: 'building', emoji: '🧱', label: 'Building', color: '#3ecf71' },
    EXPLORING: { key: 'exploring', emoji: '🔍', label: 'Exploring', color: '#6e7bf2' },
    EXPERIMENTING: { key: 'experimenting', emoji: '🧪', label: 'Experimenting', color: '#f0a641' },
    REFACTORING: { key: 'refactoring', emoji: '🧹', label: 'Refactoring', color: '#9b6ef2' },
    CONFUSED: { key: 'confused', emoji: '❓', label: 'Confused', color: '#e5484d' },
    PROPOSING: { key: 'proposing', emoji: '💡', label: 'Proposing', color: '#f0a641' },
};

// thresholds
const CLASSIFY_INTERVAL = 3000;
const IDLE_THRESHOLD = 5000;
const REWRITE_RATIO = 0.6;          // >60% deletions = experimenting
const COMMENT_RATIO = 0.5;
const UNDO_BURST = 3;               // 3+ undos = confused

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

    _freshMetrics() {
        return {
            charsAdded: 0, charsDeleted: 0,
            linesAdded: 0, linesDeleted: 0,
            cursorMoves: 0, undoRedoCount: 0,
            commentCharsAdded: 0, totalContentChanges: 0,
            renamePatterns: 0,
        };
    }

    start(onIntentChange) {
        this._onIntentChange = onIntentChange;
        this._classifyTimer = setInterval(() => {
            this._classify();
        }, CLASSIFY_INTERVAL);
    }

    stop() {
        if (this._classifyTimer) {
            clearInterval(this._classifyTimer);
            this._classifyTimer = null;
        }
        this._onIntentChange = null;
    }

    // called from CodeEditor on every onChange
    recordChange(changeEvent) {
        this._lastEditTime = Date.now();
        const { text, rangeLength, isUndo, isRedo } = changeEvent;

        const added = text ? text.length : 0;
        const deleted = rangeLength || 0;

        this._metrics.charsAdded += added;
        this._metrics.charsDeleted += deleted;
        this._metrics.totalContentChanges += 1;

        if (text) {
            this._metrics.linesAdded += (text.match(/\n/g) || []).length;
        }
        if (deleted > 0) this._metrics.linesDeleted += 1;

        if (isUndo || isRedo) this._metrics.undoRedoCount += 1;

        // check for comment patterns
        if (text && /^\s*(\/\/|\/\*|\*|#|"""|'''|<!--)/.test(text)) {
            this._metrics.commentCharsAdded += added;
        }

        // rename detection: similar-length replacement
        if (deleted > 2 && added > 2 && Math.abs(deleted - added) <= 2) {
            this._metrics.renamePatterns += 1;
        }
    }

    recordCursorMove() {
        this._metrics.cursorMoves += 1;
    }

    recordUndoRedo() {
        this._metrics.undoRedoCount += 1;
    }

    _classify() {
        const m = this._metrics;
        const idle = Date.now() - this._lastEditTime;
        const total = m.charsAdded + m.charsDeleted;

        let intent;

        if (m.undoRedoCount >= UNDO_BURST) {
            intent = INTENTS.CONFUSED;
        } else if (idle > IDLE_THRESHOLD && total === 0) {
            intent = INTENTS.EXPLORING;
        } else if (m.commentCharsAdded > 0 && total > 0 && m.commentCharsAdded / m.charsAdded > COMMENT_RATIO) {
            intent = INTENTS.PROPOSING;
        } else if (total > 10 && m.charsDeleted / total > REWRITE_RATIO) {
            intent = INTENTS.EXPERIMENTING;
        } else if (m.renamePatterns >= 2) {
            intent = INTENTS.REFACTORING;
        } else if (m.charsAdded > 10 && m.charsAdded > m.charsDeleted * 2) {
            intent = INTENTS.BUILDING;
        } else if (m.cursorMoves > 3 && total < 5) {
            intent = INTENTS.EXPLORING;
        } else if (total === 0) {
            intent = INTENTS.EXPLORING;
        } else {
            intent = this._currentIntent;
        }

        if (intent.key !== this._currentIntent.key) {
            this._previousIntent = this._currentIntent;
            this._currentIntent = intent;
            if (this._onIntentChange) this._onIntentChange(intent);
        }

        this._metrics = this._freshMetrics();
    }

    getCurrentIntent() {
        return this._currentIntent;
    }

    getPreviousIntent() {
        return this._previousIntent;
    }
}

const intentDetector = new IntentDetector();

export { INTENTS, intentDetector };
export default intentDetector;
