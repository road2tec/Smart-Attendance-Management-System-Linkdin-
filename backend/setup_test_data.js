const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./model/user');
const Department = require('./model/department');
const Group = require('./model/groups');
const Course = require('./model/course');
const Classroom = require('./model/classroom');
const Resource = require('./model/resource');
const Class = require('./model/class');

async function setup() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-attendance');
    console.log('Connected to DB');

    const studentEmail = 'student_test@gmail.com';
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      console.log('Student not found');
      process.exit(0);
    }

    const csDept = await Department.findOne({ code: 'CS' });
    if (!csDept) {
      console.log('CS department not found');
      process.exit(0);
    }

    // Find or create a mentor (teacher)
    let mentor = await User.findOne({ role: 'teacher' });
    if (!mentor) {
      console.log('No teacher found to act as mentor');
    }

    let group = await Group.findOne({ department: csDept._id });
    if (!group) {
        group = new Group({
            name: 'CS-A',
            department: csDept._id,
            students: [student._id],
            mentor: mentor?._id,
            maxCapacity: 60
        });
        await group.save();
        console.log('Created group CS-A');
    } else {
        if (!group.students.includes(student._id)) {
            group.students.push(student._id);
        }
        group.mentor = mentor?._id;
        await group.save();
        console.log('Updated student group and mentor');
    }

    const courses = await Course.find({ department: csDept._id });
    for (const course of courses) {
        let classroom = await Classroom.findOne({ course: course._id, group: group._id });
        
        // Prepare mock assessments
        const mockAssessments = [
          { 
            title: "Unit 1: Fundamentals Quiz", 
            type: "Quiz", 
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
            description: "Covers basic concepts of " + course.courseName,
            totalMarks: 20
          },
          { 
            title: "Midterm Assignment", 
            type: "Assignment", 
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 
            description: "Practical implementation of semester topics",
            totalMarks: 50
          }
        ];

        // Prepare mock resources
        const mockResData = [
          { title: "Course Syllabus - " + course.courseName, type: "pdf", url: "https://example.com/syllabus.pdf" },
          { title: "Lecture Notes: Introduction", type: "pdf", url: "https://example.com/intro.pdf" }
        ];

        let resourceIds = [];
        for (const resData of mockResData) {
          let res = await Resource.findOne({ title: resData.title, group: group._id });
          if (!res) {
            res = new Resource({
              title: resData.title,
              type: resData.type,
              group: group._id,
              uploadedBy: mentor?._id,
              files: [{ url: resData.url, filename: resData.title + ".pdf", mimetype: "application/pdf" }]
            });
            await res.save();
          }
          resourceIds.push(res._id);
        }

        if (!classroom) {
            classroom = new Classroom({
                department: csDept._id,
                assignedTeacher: mentor?._id,
                course: course._id,
                group: group._id,
                assignedStudents: [student._id],
                sharedResources: resourceIds,
                assessments: mockAssessments
            });
            await classroom.save();
        } else {
            if (!classroom.assignedStudents) classroom.assignedStudents = [];
            if (!classroom.assignedStudents.includes(student._id)) {
                classroom.assignedStudents.push(student._id);
            }
            classroom.sharedResources = resourceIds;
            classroom.assessments = mockAssessments;
            classroom.materials = undefined; 
            await classroom.save();
        }

        // Create scheduled classes for this classroom
        const classTitles = ["Lab Session: " + course.courseName, "Theory Lecture: " + course.courseName];
        let classObjects = [];

        for (let i = 0; i < classTitles.length; i++) {
          let clsObj = await Class.findOne({ title: classTitles[i], classroom: classroom._id });
          if (!clsObj) {
            clsObj = new Class({
              title: classTitles[i],
              course: course._id,
              classroom: classroom._id,
              teacher: mentor?._id,
              groups: [group._id],
              department: csDept._id,
              schedule: {
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
                daysOfWeek: [(new Date().getDay() + i + 1) % 7], // Next few days
                startTime: i === 0 ? "09:00" : "11:00",
                endTime: i === 0 ? "10:30" : "12:30"
              }
            });
            await clsObj.save();
          }
          classObjects.push({ 
            class: clsObj._id, 
            status: i === 0 ? 'in-progress' : 'scheduled',
            attendanceWindow: {
              isOpen: i === 0,
              openedAt: i === 0 ? new Date() : null,
              closesAt: i === 0 ? new Date(Date.now() + 60 * 60 * 1000) : null // 1 hour
            }
          });
        }
        
        // Link these classes to the classroom
        classroom.classes = classObjects;
        await classroom.save();
        console.log("Created/Updated classroom with classes for " + course.courseName);
    }

    console.log('Setup complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setup();
