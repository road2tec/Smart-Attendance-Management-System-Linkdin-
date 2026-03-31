const mongoose = require('mongoose');
const scheduledTasks = require('./scheduledTasks');

// Set global option to prevent "strictPopulate" errors for cleaner data fetching
mongoose.set('strictPopulate', false);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        scheduledTasks.initScheduledTasks();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
