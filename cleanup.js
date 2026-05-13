#!/usr/bin/env node

/**
 * InnBucks Database Cleanup Script
 * 
 * Usage:
 *   node cleanup.js admins     - Delete all admins
 *   node cleanup.js apps       - Delete all applications
 *   node cleanup.js both       - Delete everything
 */

const db = require('./database');
require('dotenv').config();

async function cleanup() {
    try {
        console.log('\n🔄 Connecting to database...');
        await db.connectDatabase();
        console.log('✅ Connected!\n');
        
        const choice = (process.argv[2] || '').toLowerCase();
        
        if (!['admins', 'apps', 'both'].includes(choice)) {
            console.log(`
📋 USAGE:
  node cleanup.js admins    - Delete all admins
  node cleanup.js apps      - Delete all applications  
  node cleanup.js both      - Delete everything

⚠️  This action is IRREVERSIBLE! Make sure you have a backup.
            `);
            process.exit(1);
        }
        
        if (choice === 'admins' || choice === 'both') {
            console.log('🗑️  Deleting all admins (except ADMIN001)...');
            const allAdmins = await db.getAllAdmins();
            const nonSuperAdmins = allAdmins.filter(a => a.adminId !== 'ADMIN001');
            console.log(`   📊 Found ${allAdmins.length} admin(s)`);
            console.log(`   🛡️  Protecting ADMIN001 (Super Admin)`);
            console.log(`   🗑️  Will delete ${nonSuperAdmins.length} admin(s)`);
            
            const result = await db.deleteAllAdmins();
            console.log(`   ✅ Deleted ${result.deletedCount} admin(s)\n`);
        }
        
        if (choice === 'apps' || choice === 'both') {
            console.log('🗑️  Deleting all applications...');
            const result = await db.deleteAllApplications();
            console.log(`   ✅ Deleted ${result.deletedCount} application(s)\n`);
        }
        
        await db.closeDatabase();
        console.log('✅ Cleanup complete! Database connection closed.\n');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Cleanup error:', error.message);
        console.error('\n⚠️  Make sure:');
        console.error('   1. Your .env file has MONGODB_URI set');
        console.error('   2. You can connect to the database');
        console.error('   3. You have permission to delete data\n');
        process.exit(1);
    }
}

cleanup();
