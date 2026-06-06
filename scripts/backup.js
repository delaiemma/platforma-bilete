const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_CONFIG = {
    user: 'postgres',
    host: 'localhost',
    database: 'ticket',
    password: '1q2w3e',
    port: 5432
};

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const filename = `ticket_backup_${timestamp}.sql`;
const filepath = path.join(BACKUP_DIR, filename);

const possiblePaths = [
    'pg_dump',
    '/usr/local/bin/pg_dump',
    '/opt/homebrew/bin/pg_dump',
    '/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump',
    '/Library/PostgreSQL/*/bin/pg_dump'
];

function findPgDump() {
    for (const pgPath of possiblePaths) {
        try {
            const result = exec(`${pgPath} --version`, { timeout: 1000 });
            return pgPath;
        } catch (e) {
            continue;
        }
    }
    return null;
}

function performBackup() {
    const pgDumpPath = findPgDump();

    if (!pgDumpPath) {
        console.error('❌ pg_dump not found. Using alternative backup method...');
        alternativeBackup();
        return;
    }

    const command = `PGPASSWORD='${DB_CONFIG.password}' ${pgDumpPath} -U ${DB_CONFIG.user} -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} ${DB_CONFIG.database} > "${filepath}"`;

    console.log('📦 Creating backup...');

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Backup failed:', error.message);
            alternativeBackup();
            return;
        }

        const stats = fs.statSync(filepath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('✅ Backup created successfully!');
        console.log(`📄 File: ${filename}`);
        console.log(`💾 Size: ${sizeInMB} MB`);
        console.log(`📁 Location: ${filepath}`);

        cleanOldBackups();
    });
}

async function alternativeBackup() {
    const pool = require('../config/database');

    console.log('📦 Using Node.js pg library for backup...');

    try {
        const tablesResult = await pool.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        let backupSQL = `-- Ticket Database Backup\n`;
        backupSQL += `-- Created: ${new Date().toISOString()}\n`;
        backupSQL += `-- Database: ${DB_CONFIG.database}\n\n`;

        for (const { tablename } of tablesResult.rows) {
            const schemaResult = await pool.query(`
                SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [tablename]);

            backupSQL += `\n-- Table: ${tablename}\n`;
            backupSQL += `DROP TABLE IF EXISTS ${tablename} CASCADE;\n`;
            backupSQL += `CREATE TABLE ${tablename} (\n`;

            const columns = schemaResult.rows.map(col => {
                let def = `  ${col.column_name} ${col.data_type}`;
                if (col.character_maximum_length) {
                    def += `(${col.character_maximum_length})`;
                }
                if (col.column_default) {
                    def += ` DEFAULT ${col.column_default}`;
                }
                if (col.is_nullable === 'NO') {
                    def += ' NOT NULL';
                }
                return def;
            });

            backupSQL += columns.join(',\n');
            backupSQL += `\n);\n`;

            const dataResult = await pool.query(`SELECT * FROM ${tablename}`);

            if (dataResult.rows.length > 0) {
                backupSQL += `\n-- Data for ${tablename}\n`;
                const columnNames = schemaResult.rows.map(c => c.column_name);

                for (const row of dataResult.rows) {
                    const values = columnNames.map(col => {
                        const val = row[col];
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') {
                            return `'${val.replace(/'/g, "''")}'`;
                        }
                        if (val instanceof Date) {
                            return `'${val.toISOString()}'`;
                        }
                        return val;
                    });

                    backupSQL += `INSERT INTO ${tablename} (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`;
                }
            }
        }

        fs.writeFileSync(filepath, backupSQL);

        const stats = fs.statSync(filepath);
        const sizeInKB = (stats.size / 1024).toFixed(2);

        console.log('✅ Backup created successfully (using Node.js)!');
        console.log(`📄 File: ${filename}`);
        console.log(`💾 Size: ${sizeInKB} KB`);
        console.log(`📁 Location: ${filepath}`);

        cleanOldBackups();

    } catch (error) {
        console.error('❌ Alternative backup failed:', error.message);
        process.exit(1);
    }
}

function cleanOldBackups() {
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('ticket_backup_') && f.endsWith('.sql'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length > 10) {
        console.log(`\n🧹 Cleaning old backups (keeping last 10)...`);
        files.slice(10).forEach(file => {
            fs.unlinkSync(file.path);
            console.log(`   Deleted: ${file.name}`);
        });
    }
}

performBackup();
