const fs = require('fs');
const path = require('path');

const prismaEnvPath = path.join(__dirname, 'prisma', '.env');

if (fs.existsSync(prismaEnvPath)) {
    try {
        fs.unlinkSync(prismaEnvPath);
        console.log('Successfully deleted prisma/.env');
    } catch (err) {
        console.error('Error deleting prisma/.env:', err);
    }
} else {
    console.log('prisma/.env does not exist');
}
