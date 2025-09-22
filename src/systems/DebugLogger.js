class DebugLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 500;

        // Load existing logs from localStorage
        const stored = localStorage.getItem('ratrace_debug_logs');
        if (stored) {
            this.logs = JSON.parse(stored);
        }

        // Add timestamp to start
        this.log('SESSION', 'Debug session started');
    }

    log(category, message, data = null) {
        const timestamp = new Date().toISOString();
        const entry = {
            timestamp,
            category,
            message,
            data
        };

        this.logs.push(entry);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Save to localStorage
        localStorage.setItem('ratrace_debug_logs', JSON.stringify(this.logs));

        // Also log to console
        console.log(`[${category}] ${message}`, data || '');
    }

    clear() {
        this.logs = [];
        localStorage.removeItem('ratrace_debug_logs');
        console.log('Debug logs cleared');
    }

    getLogs() {
        return this.logs;
    }

    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }

    exportLogs() {
        const output = this.logs.map(log => {
            let line = `${log.timestamp} [${log.category}] ${log.message}`;
            if (log.data) {
                line += ' - ' + JSON.stringify(log.data);
            }
            return line;
        }).join('\n');

        console.log('=== DEBUG LOG EXPORT ===');
        console.log(output);
        console.log('=== END DEBUG LOG ===');

        return output;
    }
}

// Global instance
window.debugLogger = new DebugLogger();