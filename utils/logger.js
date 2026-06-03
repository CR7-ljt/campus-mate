const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
};

const getLogFileName = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.log`;
};

const log = (level, message, data = {}) => {
    const timestamp = getTimestamp();
    const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        data: Object.keys(data).length > 0 ? data : undefined
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(path.join(logDir, getLogFileName()), logLine);
    
    if (process.env.NODE_ENV !== 'production') {
        const colorMap = {
            info: '\x1b[36m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[34m'
        };
        const color = colorMap[level] || '\x1b[37m';
        console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}\x1b[0m`, data);
    }
};

const logger = {
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
    debug: (message, data) => log('debug', message, data)
};

module.exports = logger;