import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node.js v17+: use Google DNS to resolve MongoDB SRV records
// Node.js libuv DNS sometimes fails with the default system DNS server
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, { family: 4 });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Error connecting to database', error);
        process.exit(1);
    }
}