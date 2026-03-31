const mongoose = require('mongoose');
const Department = require('../model/department');
require('dotenv').config();

const departments = [
  { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Engineering' },
  { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
  { name: 'Electronics Engineering', code: 'ENTC', description: 'Department of Electronics and Telecommunication' },
  { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' }
];

const seedDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartattend');
        console.log('Connected to MongoDB');

        for (const dept of departments) {
            const existing = await Department.findOne({ code: dept.code });
            if (!existing) {
                await Department.create(dept);
                console.log(`Created department: ${dept.name}`);
            } else {
                console.log(`Department ${dept.code} already exists`);
            }
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding departments:', error);
        process.exit(1);
    }
};

seedDepartments();
