const Classroom = require('../model/classroom');
const Submission = require('../model/submission');
const mongoose = require('mongoose');

// NEW: Add a test/assignment to a classroom
const createAssessment = async (req, res, next) => {
    try {
        const { classroomId } = req.params;
        const { title, type, dueDate, description, instructions, totalMarks, questions } = req.body;
        console.log(`Creating assessment for classroom ${classroomId}: ${title}`);

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        const newAssessment = {
            title,
            type,
            dueDate: new Date(dueDate),
            description,
            instructions,
            totalMarks: Number(totalMarks),
            questions,
            status: 'published'
        };

        if (!classroom.assessments) classroom.assessments = [];
        classroom.assessments.push(newAssessment);
        await classroom.save();

        res.status(201).json({ success: true, message: 'Assessment published successfully', data: newAssessment });
    } catch (error) {
        console.error('Create Assessment Error:', error);
        next(error);
    }
};

const submitAssessment = async (req, res, next) => {
    try {
        const { classroomId, assessmentId } = req.params;
        const { answers } = req.body;
        const studentId = req.user.userId;

        const existing = await Submission.findOne({ classroomId, assessmentId, student: studentId });
        if (existing) return res.status(400).json({ message: 'You have already submitted this assessment' });

        const submission = await Submission.create({
            classroomId,
            assessmentId,
            student: studentId,
            answers,
            status: 'submitted'
        });

        res.status(201).json({ success: true, message: 'Assessment submitted successfully', data: submission });
    } catch (error) {
        console.error('Submit Assessment Error:', error);
        next(error);
    }
};

const evaluateSubmission = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const { obtainedMarks, teacherRemarks } = req.body;

        const submission = await Submission.findByIdAndUpdate(submissionId, {
            obtainedMarks: Number(obtainedMarks),
            teacherRemarks,
            status: 'graded'
        }, { new: true });

        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        res.status(200).json({ success: true, message: 'Submission graded successfully', data: submission });
    } catch (error) {
        console.error('Evaluate Submission Error:', error);
        next(error);
    }
};

const getSubmissions = async (req, res, next) => {
    try {
        const { assessmentId } = req.params;
        const submissions = await Submission.find({ assessmentId }).populate('student', 'firstName lastName rollNumber');
        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error('Fetch Submissions Error:', error);
        next(error);
    }
};

module.exports = {
    createAssessment,
    submitAssessment,
    evaluateSubmission,
    getSubmissions
};
