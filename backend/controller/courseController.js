const mongoose = require('mongoose');
const Course = require('../model/course');
const User = require('../model/user');
const Department = require('../model/department');
const Group = require('../model/groups');

// Create Course with auto-assignment to department groups
const createCourse = async (req, res) => {
  try {
    const { department, courseCoordinator, ...courseData } = req.body;
    
    if (!department || !mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({ error: 'Valid Department ID is required' });
    }
    
    // Validate department exists
    const departmentObj = await Department.findById(department);
    if (!departmentObj) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Validate coordinator exists if provided
    if (courseCoordinator) {
      const coordinatorObj = await User.findById(courseCoordinator);
      if (!coordinatorObj) {
        return res.status(404).json({ error: 'Course Coordinator not found' });
      }
    }
    
    // Create the new course
    const newCourse = new Course({
      ...courseData,
      department: departmentObj._id,
      courseCoordinator: courseCoordinator || req.user.userId,
      createdBy: req.user.userId
    });
    
    await newCourse.save();
    
    // Add course to department
    departmentObj.courses.push(newCourse._id);
    await departmentObj.save();
    
    // Auto-assign course to all active groups in the same department
    const departmentGroups = await Group.find({ 
      department: departmentObj._id,
      isActive: true 
    });
    
    // Track the assignments for response
    const groupAssignments = [];
    
    // Assign course to each group
    for (const group of departmentGroups) {
      group.courses.push(newCourse._id);
      await group.save();
      groupAssignments.push({
        groupId: group._id,
        groupName: group.name
      });
    }
    const populatedCourse = await Course.findById(newCourse._id)
  .populate('courseCoordinator')
  .populate('department');
    
    // Return the course and group assignments
    res.status(201).json({
      course: populatedCourse,
      assignedToGroups: groupAssignments,
      message: `Course automatically assigned to ${groupAssignments.length} groups in the department`
    });
  } catch (err) {
    console.error('Course creation failure:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'CATALOGUE CONFLICT: This Course Code is already registered in the institutional registry.' });
    }
    res.status(500).json({ error: err.message || 'Institutional database failure during session initialization.' });
  }
};

// Admin can view all courses
const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('department')
      .populate('courseCoordinator')
      .populate('createdBy', 'firstName lastName email')
      .populate('instructors');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCoursesForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    
    // Find courses where this teacher is either the creator, coordinator, or instructor
    const courses = await Course.find({
      $or: [
        { createdBy: teacherId },
        { courseCoordinator: teacherId },
        { instructors: teacherId }
      ]
    }).populate('department').populate('instructors').populate('createdBy', 'firstName lastName email');
    
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get courses for a specific group
const getCoursesForGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Get all courses assigned to this group
    const courses = await Course.find({
      _id: { $in: group.courses }
    }).populate('department courseCoordinator');
    
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCoursesForStudent = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    // Find student's group(s)
    const studentGroups = await Group.find({
      students: studentId
    });
    
    // Collect course IDs from all student's groups
    const groupCourseIds = studentGroups.flatMap(group => group.courses);
    
    // Get courses from both direct enrollment and group assignment
    const courses = await Course.find({
      $or: [
        { 'enrolledStudents.student': studentId },
        { _id: { $in: groupCourseIds } }
      ]
    }).populate('department courseCoordinator');
    
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('department')
      .populate('courseCoordinator')
      .populate('instructors')
      .populate('enrolledStudents.student', 'firstName lastName email rollNumber');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign Coordinator
const assignCoordinator = async (req, res) => {
  try {
    const { coordinatorId } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { courseCoordinator: coordinatorId },
      { new: true }
    ).populate('courseCoordinator department');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enroll in Course
const enrollInCourse = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      (entry) => entry.student.toString() === studentId
    );
    
    if (isEnrolled) {
      return res.status(400).json({ error: 'Student already enrolled' });
    }
    
    course.enrolledStudents.push({ student: studentId });
    await course.save();
    
    const populatedCourse = await Course.findById(course._id)
      .populate('department')
      .populate('courseCoordinator');
      
    res.json(populatedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseData = req.body;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: courseData },
      { new: true }
    ).populate('department courseCoordinator instructors');
    
    if (!updatedCourse) return res.status(404).json({ error: 'Course not found' });
    
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manually assign course to a group
const assignCourseToGroup = async (req, res) => {
  const courseId = req.params.id;
  const { groupId } = req.body;
  
  try {
    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if course is already assigned to the group
    if (group.courses.includes(courseId)) {
      return res.status(400).json({ error: 'Course already assigned to this group' });
    }
    
    // Add course to group
    group.courses.push(courseId);
    await group.save();
    
    res.status(200).json({
      message: 'Course successfully assigned to group',
      course: courseId,
      group: groupId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove course from a group
const removeCourseFromGroup = async (req, res) => {
  const courseId = req.params.id;
  const { groupId } = req.body;
  
  try {
    // Verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Remove course from group
    group.courses = group.courses.filter(id => id.toString() !== courseId);
    await group.save();
    
    res.status(200).json({
      message: 'Course successfully removed from group',
      course: courseId,
      group: groupId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all courses by department
const getCoursesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Verify department exists
    const departmentObj = await Department.findById(departmentId);
    if (!departmentObj) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Find courses for this department
    const courses = await Course.find({ department: departmentId })
      .populate('courseCoordinator')
      .populate('instructors');
    
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete course (Admin only)
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Find the course first to get its department
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Remove reference from department
    if (course.department) {
      await Department.findByIdAndUpdate(course.department, {
        $pull: { courses: courseId }
      });
    }
    
    // Remove reference from all groups
    await Group.updateMany(
      { courses: courseId },
      { $pull: { courses: courseId } }
    );
    
    // Delete the course
    await Course.findByIdAndDelete(courseId);
    
    res.json({ message: 'Course deleted successfully', _id: courseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignTeacherToCourse = async (req, res) => {
  try {
      const { courseId } = req.params;
      const { teacherId, groupId } = req.body;

      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(teacherId)) {
          return res.status(400).json({ error: 'Invalid course or teacher ID' });
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
          return res.status(404).json({ error: 'Course not found' });
      }

      // Add teacher to instructors if not already present
      if (!course.instructors.includes(teacherId)) {
          course.instructors.push(teacherId);
      }
      
      await course.save();

      // If groupId is provided, also ensure the course is assigned to that group
      if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
          const group = await Group.findById(groupId);
          if (group && !group.courses.includes(courseId)) {
              group.courses.push(courseId);
              await group.save();
          }
      }

      const populatedCourse = await Course.findById(courseId)
          .populate('department')
          .populate('courseCoordinator')
          .populate('instructors');

      res.status(200).json(populatedCourse);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCourse,
  getAllCoursesForAdmin,
  getCoursesForTeacher,
  getCoursesForStudent,
  getCourseById,
  assignCoordinator,
  enrollInCourse,
  updateCourse,
  deleteCourse,
  getCoursesByDepartment,
  assignCourseToGroup,
  removeCourseFromGroup,
  getCoursesForGroup,
  assignTeacherToCourse
};