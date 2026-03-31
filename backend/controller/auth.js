const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Embedding = require('../model/embedding'); 
const upload = require('../utils/multerConfig');
const Department = require('../model/department');
const Groups = require('../model/groups');
const mongoose = require('mongoose');
const Classroom = require('./../model/classroom')
// Login controller remains unchanged
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check account status
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for verification.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Your account registration has been rejected. Contact admin for details.' });
        }
 
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role, status: user.status },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const signup = async (req, res) => {
    try {
        upload.single('profileImage')(req, res, async (err) => {
            try {
            if (err) {
                return res.status(400).json({ message: `Image upload failed ${err}` });
            }

            const {
                firstName,
                lastName,
                email,
                password,
                role,
                mobile,
                permanentAddress,
                currentAddress,
                rollNumber,
                admissionYear,
                group,
                department, 
                employeeId,
                dateOfBirth,
                gender,
                faceEmbedding,
                studentEmail  // For parent linking
            } = req.body;
            
            console.log('SIGNUP ATTEMPT:', { 
              role, 
              email, 
              hasFile: !!req.file, 
              hasEmbedding: !!faceEmbedding,
              department 
            });
            
            // Only require faceEmbedding for students (NOT for teachers or parents)
            const isParent = role && role.toLowerCase() === 'parent';
            if (!faceEmbedding && role && role.toLowerCase() !== 'teacher' && !isParent) {
                return res.status(400).json({ message: 'Face capture is required. Please capture a clear face image and try again.' });
            }

            // For parent role: validate that studentEmail is provided and the student exists
            let linkedStudentId = null;
            if (isParent) {
                if (!studentEmail) {
                    return res.status(400).json({ message: 'Child college email is required for parent registration.' });
                }
                const linkedStudentUser = await User.findOne({ email: studentEmail, role: 'student' });
                if (!linkedStudentUser) {
                    return res.status(400).json({ message: 'No student found with that email address. Please verify the email and try again.' });
                }
                linkedStudentId = linkedStudentUser._id;
            }

            let parsedEmbedding = null;
            if (faceEmbedding && faceEmbedding !== 'undefined' && faceEmbedding !== 'null' && faceEmbedding !== '') {
                try {
                    parsedEmbedding = typeof faceEmbedding === 'string'
                        ? JSON.parse(faceEmbedding)
                        : faceEmbedding;
                } catch (parseError) {
                    return res.status(400).json({ message: 'Invalid face embedding data. Please recapture your face and try again.' });
                }

                if (!Array.isArray(parsedEmbedding) || parsedEmbedding.length === 0) {
                    return res.status(400).json({ message: 'Face embedding data is empty. Please recapture your face and try again.' });
                }
            }

            let parsedPermanentAddress = permanentAddress;
            let parsedCurrentAddress = currentAddress;

            if (typeof permanentAddress === 'string' && permanentAddress.trim() !== '') {
                try {
                    parsedPermanentAddress = JSON.parse(permanentAddress);
                } catch (parseError) {
                    return res.status(400).json({ message: 'Invalid permanent address format.' });
                }
            }

            if (typeof currentAddress === 'string' && currentAddress.trim() !== '') {
                try {
                    parsedCurrentAddress = JSON.parse(currentAddress);
                } catch (parseError) {
                    return res.status(400).json({ message: 'Invalid current address format.' });
                }
            }
            
            if (!password) {
                return res.status(400).json({ message: 'Password is required' });
            }
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: '[Auth:UserExists] User with this email already exists.' });
            }

            // Validate department ID if provided
            let departmentExists = null;
            let groupExists = null;
            if (department && mongoose.Types.ObjectId.isValid(department)) {
                 departmentExists = await Department.findById(department);
                if (!departmentExists) {
                    return res.status(400).json({ message: '[Auth:DeptNotFound] Selected Department was not found in database.' });
                }
            } else if (department) {
                return res.status(400).json({ message: '[Auth:InvalidDeptID] Invalid Department ID provided.' });
            }

            // Validate group ID if provided
            if (group && mongoose.Types.ObjectId.isValid(group)) {
                groupExists = await Groups.findById(group);
                if (!groupExists) {
                    return res.status(400).json({ message: '[Auth:GroupNotFound] Selected Group was not found.' });
                }
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user without embedding reference first
            const user = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role ? role.toLowerCase() : undefined, 
                mobile: mobile || undefined,
                permanentAddress: parsedPermanentAddress, 
                currentAddress: parsedCurrentAddress,   
                rollNumber,
                admissionYear,
                department: departmentExists ? departmentExists._id : undefined,
                group: groupExists ? groupExists._id : undefined,
                employeeId,
                dateOfBirth: dateOfBirth || undefined,
                gender: gender ? gender.toLowerCase() : undefined,  
                profileImage: req.file ? req.file.path : null,
                status: role && role.toLowerCase() === 'teacher' ? 'pending' : 'active',
                linkedStudent: linkedStudentId || undefined,
            });

            // Save the user to get an _id
            await user.save();
            
            // Only create embedding if data was provided (mandatory for students, optional for teachers)
            if (parsedEmbedding) {
                const embeddingDoc = new Embedding({
                    user: user._id,
                    embedding: parsedEmbedding,
                    isActive: true
                });
                
                await embeddingDoc.save();
                
                // Update the user with the reference to the embedding
                user.faceEmbedding = embeddingDoc._id;
                await user.save();
            }
            
            // If the user is a student and has been assigned to a group,
            // add them to all classrooms associated with that group
            if (role && role.toLowerCase() === 'student' && groupExists) {
                // Find all classrooms that have the same group as this user
                const classrooms = await Classroom.find({ group: groupExists._id });
                
                // Add this student to assignedStudents in each classroom
                for (const classroom of classrooms) {
                    // Only add if the student isn't already in the list
                    if (!classroom.assignedStudents.includes(user._id)) {
                        classroom.assignedStudents.push(user._id);
                        await classroom.save();
                    }
                }
                
                // Also update the Group schema to include this student
                if (!groupExists.students.includes(user._id)) {
                    groupExists.students.push(user._id);
                    await groupExists.save();
                }
            }
            
            // Generate JWT token ONLY if user is active (not for pending teachers)
            let token = null;
            if (user.status === 'active') {
                token = jwt.sign(
                    { userId: user._id, role: user.role, status: user.status },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
            }
            
            res.status(201).json({
                message: user.status === 'pending' 
                    ? 'Registration successful. Your account is pending admin approval.' 
                    : 'User created successfully',
                token,
                user
            });
            } catch (innerError) {
                console.error('SIGNUP ERROR LOG:', innerError);
                return res.status(400).json({ 
                  message: innerError.message || 'Registration failed',
                  error: innerError.errors || innerError
                });
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const me = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
    
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        // Fetch the user without returning password
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // console.log(user);
        res.status(200).json({ user });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}, '_id name code groups')
      .populate('groups', '_id name maxCapacity'); 

    res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
};

const getGroups = async(req, res) => {

}
module.exports = { login, signup, me , getDepartments, getGroups};