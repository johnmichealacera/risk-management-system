#!/usr/bin/env node
/**
 * Post-deployment script for Vercel
 * Runs database migrations and seeds initial data
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function postDeploy() {
  try {
    console.log('🚀 Starting post-deployment setup...');

    // Generate Prisma Client (should already be done in postinstall, but ensure it's there)
    console.log('📦 Ensuring Prisma Client is generated...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run migrations
    console.log('🗄️  Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Check if database needs seeding (only seed if no users exist)
    console.log('🌱 Checking if database needs seeding...');
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('📊 Database is empty, running seed...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
      console.log('✅ Seed completed successfully!');
    } else {
      console.log(`ℹ️  Database already has ${userCount} user(s), skipping seed.`);
    }

    console.log('✅ Post-deployment setup complete!');
  } catch (error) {
    console.error('❌ Post-deployment setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

postDeploy();

