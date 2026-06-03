const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Railway 持久化存储路径
const RAILWAY_VOLUME_DIR = process.env.RAILWAY_VOLUME_DIR;
let dbPath;

if (RAILWAY_VOLUME_DIR) {
    // Railway 环境
    dbPath = path.join(RAILWAY_VOLUME_DIR, 'campus_mate.db');
    // 确保目录存在
    if (!fs.existsSync(RAILWAY_VOLUME_DIR)) {
        fs.mkdirSync(RAILWAY_VOLUME_DIR, { recursive: true });
    }
} else {
    // 本地环境
    dbPath = path.join(__dirname, '../campus_mate.db');
}

console.log('数据库路径:', dbPath);
let db = null;

function init() {
    db = new Database(dbPath, { verbose: null });
    db.pragma('journal_mode = WAL');
    db.pragma('cache_size = 10000');
    db.pragma('foreign_keys = ON');
    
    console.log('数据库连接成功');
    createTables();
    createIndexes();
    insertMockData();
}

function createTables() {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            grade TEXT,
            major TEXT,
            bio TEXT,
            campus TEXT,
            avatar TEXT DEFAULT 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=young%20college%20student%20avatar%20friendly%20smile%20simple%20style&image_size=square',
            status TEXT DEFAULT 'online',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const competitionsTable = `
        CREATE TABLE IF NOT EXISTS competitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            competition_name TEXT,
            max_members INTEGER DEFAULT 5,
            current_members INTEGER DEFAULT 1,
            skills TEXT,
            requirements TEXT,
            deadline TEXT,
            contact TEXT NOT NULL,
            urgent INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    const mealsTable = `
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            time TEXT,
            location TEXT,
            preference TEXT,
            note TEXT,
            contact TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    const hobbiesTable = `
        CREATE TABLE IF NOT EXISTS hobbies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category TEXT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            time TEXT,
            location TEXT,
            duration TEXT DEFAULT '短期',
            description TEXT,
            contact TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    const favoritesTable = `
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            post_type TEXT NOT NULL,
            post_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, post_type, post_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    const refreshTokensTable = `
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    db.exec(usersTable);
    db.exec(competitionsTable);
    db.exec(mealsTable);
    db.exec(hobbiesTable);
    db.exec(favoritesTable);
    db.exec(refreshTokensTable);
    console.log('数据表创建成功');
}

function createIndexes() {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);',
        'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);',
        'CREATE INDEX IF NOT EXISTS idx_competitions_user_id ON competitions(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_competitions_type ON competitions(type);',
        'CREATE INDEX IF NOT EXISTS idx_competitions_urgent ON competitions(urgent);',
        'CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);',
        'CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(type);',
        'CREATE INDEX IF NOT EXISTS idx_meals_status ON meals(status);',
        'CREATE INDEX IF NOT EXISTS idx_hobbies_user_id ON hobbies(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_hobbies_type ON hobbies(type);',
        'CREATE INDEX IF NOT EXISTS idx_hobbies_status ON hobbies(status);',
        'CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);'
    ];

    indexes.forEach(index => {
        try {
            db.exec(index);
        } catch (err) {
            console.log('索引已存在:', err.message);
        }
    });
    console.log('索引创建成功');
}

function insertMockData() {
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (count.count === 0) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('123456', 12);
        
        db.prepare('INSERT INTO users (nickname, password, grade, major, bio, campus) VALUES (?, ?, ?, ?, ?, ?)')
            .run('校园小达人', hashedPassword, '大三', '计算机科学与技术', '热爱编程，喜欢打篮球，寻找志同道合的小伙伴！', '东校区');
        
        db.prepare('INSERT INTO users (nickname, password, grade, major, bio, campus) VALUES (?, ?, ?, ?, ?, ?)')
            .run('数模小王子', hashedPassword, '大二', '数学与应用数学', '数学建模爱好者', '西校区');
        
        db.prepare('INSERT INTO users (nickname, password, grade, major, bio, campus) VALUES (?, ?, ?, ?, ?, ?)')
            .run('干饭王', hashedPassword, '大一', '土木工程', '爱吃美食，寻找饭搭子', '东校区');

        db.prepare('INSERT INTO competitions (user_id, type, title, competition_name, max_members, current_members, skills, requirements, deadline, contact, urgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run(2, 'math_modeling', '2026数学建模竞赛组队', '全国大学生数学建模竞赛', 3, 2, '数学建模,编程,论文写作', '希望队友有数学建模经验', '2026-09-15', '微信：math_model_2026', 1);
        
        db.prepare('INSERT INTO meals (user_id, type, title, time, location, preference, note, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            .run(3, 'canteen', '中午食堂干饭搭子', '今天 12:00', '一食堂二楼', '爱吃辣', '随缘搭伴', '微信：ganfan_king');

        db.prepare('INSERT INTO hobbies (user_id, category, type, title, time, location, duration, description, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .run(1, 'sports', 'basketball', '下午篮球场组队', '今天 16:00', '西校区篮球场', '短期', '寻找篮球搭子', '微信：basketball_kid');
        
        console.log('模拟数据插入成功');
    }
}

function query(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(params);
}

function run(sql, params = []) {
    const stmt = db.prepare(sql);
    const info = stmt.run(params);
    return { lastID: info.lastInsertRowid, changes: info.changes };
}

function get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(params);
}

function transaction(fn) {
    const tx = db.transaction(fn);
    return tx();
}

module.exports = {
    init,
    query,
    run,
    get,
    transaction
};