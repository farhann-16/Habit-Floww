import { prisma } from './config/prisma';
import { firebaseAdmin } from './config/firebase';

async function verify() {
    console.log('Verifying connections...');

    // 1. Check Database
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ Database connected! User count: ${userCount}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }

    // 2. Check Firebase
    try {
        // Just checking if the app is initialized is usually enough, 
        // but let's try to list users (might fail if no users or permissions, but confirms SDK is active)
        // Actually, just checking the project ID is safer for a basic check.
        const appName = firebaseAdmin.app().name;
        console.log(`✅ Firebase Admin initialized! App name: ${appName}`);
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        process.exit(1);
    }

    console.log('🎉 All systems go!');
}

verify()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
