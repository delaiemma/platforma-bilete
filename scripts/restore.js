const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BACKUP_DIR = path.join(__dirname, '../backups');
const pool = require('../config/database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function listBackups() {
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('ticket_backup_') && f.endsWith('.sql'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
        console.log('❌ No backups found!');
        process.exit(1);
    }

    console.log('\n📦 Available backups:\n');
    files.forEach((file, index) => {
        const size = (fs.statSync(file.path).size / 1024).toFixed(2);
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Created: ${file.time.toLocaleString()}`);
        console.log(`   Size: ${size} KB\n`);
    });

    return files;
}

async function dropAllTables() {
    console.log('🗑️  Dropping all existing tables...');

    const result = await pool.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    `);

    for (const { tablename } of result.rows) {
        await pool.query(`DROP TABLE IF EXISTS ${tablename} CASCADE`);
        console.log(`   Dropped: ${tablename}`);
    }
}

async function restoreFromFile(filepath) {
    console.log(`\n📥 Restoring from: ${path.basename(filepath)}`);

    const sql = fs.readFileSync(filepath, 'utf8');

    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
        try {
            await pool.query(statement);
            successCount++;
        } catch (error) {
            if (!error.message.includes('already exists')) {
                console.error(`⚠️  Error: ${error.message.split('\n')[0]}`);
                errorCount++;
            }
        }
    }

    console.log(`\n✅ Restore completed!`);
    console.log(`   Success: ${successCount} statements`);
    if (errorCount > 0) {
        console.log(`   Warnings: ${errorCount} errors (might be normal)`);
    }
}

async function main() {
    try {
        const backups = await listBackups();

        rl.question('Enter backup number to restore (or 0 to cancel): ', async (answer) => {
            const index = parseInt(answer) - 1;

            if (index === -1) {
                console.log('❌ Restore cancelled');
                process.exit(0);
            }

            if (index < 0 || index >= backups.length) {
                console.log('❌ Invalid backup number');
                process.exit(1);
            }

            const selectedBackup = backups[index];

            console.log(`\n⚠️  WARNING: This will DELETE all current data!`);
            console.log(`You are about to restore: ${selectedBackup.name}\n`);

            rl.question('Type "yes" to confirm: ', async (confirm) => {
                if (confirm.toLowerCase() !== 'yes') {
                    console.log('❌ Restore cancelled');
                    process.exit(0);
                }

                try {
                    await dropAllTables();
                    await restoreFromFile(selectedBackup.path);

                    console.log('\n🎉 Database restored successfully!');
                } catch (error) {
                    console.error('\n❌ Restore failed:', error.message);
                    process.exit(1);
                } finally {
                    await pool.end();
                    rl.close();
                }
            });
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        rl.close();
        process.exit(1);
    }
}

main();
