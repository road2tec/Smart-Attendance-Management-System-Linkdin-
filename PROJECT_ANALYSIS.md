# 📚 SmartAttend Project - Complete Step-by-Step Guide

## 🎯 Project Overview
SmartAttend is a **Smart Attendance System** using **Facial Recognition** and **Location Verification** to prevent proxy attendance in educational institutions.

### Key Technologies:
- **Frontend**: React.js + Vite + Redux Toolkit + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary
- **Facial Recognition**: face-api.js library

---

## 🏗️ Project Architecture

```
SmartAttend/
├── backend/                    # Node.js/Express server
│   ├── controller/            # Business logic
│   ├── model/                 # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth & role checks
│   ├── utils/                 # Database, config
│   ├── scripts/               # Seed data
│   └── index.js              # Main server
│
└── frontend/                   # React app
    ├── src/
    │   ├── pages/            # Route pages (Auth, Admin, Teacher, Student)
    │   ├── components/       # Reusable components
    │   ├── app/features/     # Redux slices & thunks
    │   ├── context/          # Theme, Auth providers
    │   ├── services/         # API calls
    │   └── App.jsx          # Main routing
    └── package.json
```

---

## 🔐 User Roles & Their Dashboards

### 1️⃣ **ADMIN** (admin@mail.com / 123456Aa)
**Responsibilities:**
- Create and manage departments (CSE, MBA, etc.)
- Define courses and assign to departments
- Create student groups
- Register teachers and assign to courses/groups
- View attendance analytics

**Dashboard Flow:**
```
Admin Login → Admin Dashboard 
├── Course Management (Create/Edit courses)
├── Department Management (Create departments)
├── Group Management (Create groups, assign students)
├── Enrolled Users (Manage teachers/students)
└── Attendance Dashboard (View analytics)
```

**Key Endpoints:**
- POST `/api/departments/create` - Create department
- POST `/api/courses/create` - Create course
- POST `/api/groups/department/:id/create` - Create group
- POST `/api/users/register` - Register teacher

---

### 2️⃣ **TEACHER** (testteacher@gmail.com / Aa123456)
**Responsibilities:**
- View assigned classrooms
- Schedule classes (regular & extra)
- Open/close attendance windows
- Mark attendance manually
- Share class materials

**Dashboard Flow:**
```
Teacher Login → Teacher Dashboard
├── Classes Section
│   ├── View assigned classrooms
│   └── Schedule New Class (requires classroom assignment)
├── Class Details
│   ├── Edit class schedule
│   ├── Update location
│   └── Share materials
└── Attendance Control
    ├── Open attendance window
    └── Mark attendance manually
```

**Important:** Teacher MUST be assigned to a classroom first (done by Admin)

**Key Endpoints:**
- GET `/api/classroom/teacher/:id` - Get assigned classrooms
- POST `/api/classes` - Schedule class
- POST `/api/attendance/open-window` - Open attendance
- POST `/api/attendance/mark-manual` - Mark attendance

---

### 3️⃣ **STUDENT** (test123@gmail.com / Aa123456)
**Responsibilities:**
- View scheduled classes
- Mark attendance using facial recognition + location
- View attendance history
- Access class materials

**Dashboard Flow:**
```
Student Login → Student Dashboard
├── Classrooms (View assigned classes)
│   ├── See active classes
│   └── See upcoming classes
├── Mark Attendance (When window is open)
│   ├── Facial recognition scan
│   ├── Location verification (GPS)
│   └── Submit attendance
└── Attendance History
    ├── View attendance records
    └── View attendance charts
```

**Key Endpoints:**
- GET `/api/classroom/student/:id` - Get assigned classes
- POST `/api/attendance/mark` - Mark attendance
- GET `/api/attendance/student/:id` - Get attendance history

---

## 🔄 Complete Workflow (Step-by-Step)

### **STEP 1: SETUP (Backend & Database)**
```bash
# 1.1 Install backend dependencies
cd backend
npm install

# 1.2 Create .env file with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartattend
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# 1.3 Start MongoDB (locally or use cloud MongoDB)
# If local: mongod

# 1.4 Start backend server
npm run dev
# Backend runs on http://localhost:5000
```

---

### **STEP 2: SETUP (Frontend)**
```bash
# 2.1 Install frontend dependencies
cd frontend
npm install

# 2.2 Frontend .env already configured with:
VITE_API_URL=http://localhost:5000/api

# 2.3 Start frontend dev server
npm run dev
# Frontend runs on http://localhost:5173
```

---

### **STEP 3: ADMIN SETUP (Create Base Data)**

**Login as Admin:** `admin@mail.com` / `123456Aa`

#### 3.1 Create Department
1. Go to **Admin Dashboard** → **Department Management**
2. Click **"Create Department"**
3. Enter:
   - Department Name: "Computer Science" (or any name)
   - Description: (optional)
4. Click **Save**

#### 3.2 Create Course
1. Go to **Admin Dashboard** → **Course Management**
2. Click **"Create Course"**
3. Enter:
   - Course Name: "Data Structures"
   - Course Code: "CS101"
   - Department: Select the department you created
   - Description: (optional)
4. Click **Save**

#### 3.3 Create Student Group
1. Go to **Admin Dashboard** → **Group Management**
2. Click **"Create Group"**
3. Enter:
   - Group Name: "CSE-2A"
   - Department: Select department
   - Batch Year: "2024"
4. Click **Save**

#### 3.4 Register Teacher
1. Go to **Admin Dashboard** → **Enrolled Users**
2. Click **"Add Teacher"**
3. Fill in:
   - First Name, Last Name
   - Email: (unique email)
   - Password: (secure password)
   - Department: Select department
4. Click **Register**

#### 3.5 Register Student
1. Go to **Admin Dashboard** → **Enrolled Users**
2. Click **"Add Student"**
3. Fill in:
   - First Name, Last Name
   - Email: (unique email)
   - Roll Number: "1001"
   - Group: Select group
   - Admission Year: "2024"
4. Click **Register**

#### 3.6 Assign Teacher to Course/Group
1. Go to **Course Management**
2. Select the course
3. Click **"Assign Teacher"**
4. Select:
   - Teacher: Select teacher
   - Group: Select group
5. Click **Assign**

This creates a **"Classroom"** (teaching assignment)

---

### **STEP 4: TEACHER WORKFLOW (Schedule Classes)**

**Login as Teacher:** Use the email/password from step 3.4

#### 4.1 View Assigned Classrooms
1. Go to **Teacher Dashboard** → **Classes**
2. You'll see all classrooms (teaching assignments)

#### 4.2 Schedule a New Class
1. Click **"New Class"** button
2. A modal opens with form fields:

**Form Fields:**
```
- Title: "Lecture 1: Arrays" (name of class)
- Course: (pre-filled from classroom)
- Classroom: (pre-filled from classroom)
- Department: (pre-filled)
- Groups: (pre-filled)

CHOOSE ONE:
A) Regular Class:
   - Start Date: 2024-03-01
   - End Date: 2024-06-01
   - Days of Week: [Monday, Wednesday, Friday]
   - Start Time: 10:00 AM
   - End Time: 11:30 AM

B) Extra Class (One-time):
   - Check "Is Extra Class"
   - Extra Class Date: 2024-03-15
   - Start Time: 02:00 PM
   - End Time: 03:30 PM

Optional:
- Topics: ["Introduction", "Basic concepts"]
- Notes: "Bring textbook"
- Special Requirements: "Laptop required"
```

3. Click **"Schedule"**
4. Class is created ✅

#### 4.3 Open Attendance Window
1. In class list, click on a scheduled class
2. Click **"Open Attendance Window"**
3. Students can now mark attendance

#### 4.4 Mark Attendance Manually
1. Click **"Mark Attendance"**
2. Select students from list
3. Click checkmark to mark present
4. Click **"Save"**

---

### **STEP 5: STUDENT WORKFLOW (Mark Attendance)**

**Login as Student:** Use the email/password from step 3.5

#### 5.1 View Assigned Classes
1. Go to **Student Dashboard** → **Classrooms**
2. See all classes you're enrolled in

#### 5.2 Mark Attendance (When Window is Open)
1. Click on an active class
2. If attendance window is **open**, see **"Mark Attendance"** button
3. Click it → Camera modal opens

**Attendance Process:**
```
1. Facial Recognition:
   - Allow camera access
   - Face detection starts
   - System captures face embedding
   - Compares with your registered face
   
2. Location Verification:
   - Allow GPS/location access
   - System gets your GPS coordinates
   - Checks if you're within classroom radius
   
3. Submit:
   - If both pass → Attendance marked ✅
   - If face doesn't match → Show error
   - If location too far → Show error
```

#### 5.3 View Attendance History
1. Go to **Student Dashboard** → **Attendance**
2. See:
   - List of all attendance records
   - Charts showing attendance rate
   - Subject-wise breakdown

---

## 📊 API Endpoint Summary

### **Authentication**
```
POST   /api/auth/signup           - Register new user
POST   /api/auth/login            - Login user
GET    /api/auth/me               - Get current user
GET    /api/auth/departments      - Get all departments (public)
```

### **Users**
```
GET    /api/users/students        - Get all students (admin only)
GET    /api/users/teachers        - Get all teachers (admin only)
GET    /api/users/:id             - Get user by ID
PUT    /api/users/profile         - Update profile
```

### **Departments**
```
POST   /api/departments/create    - Create department (admin)
GET    /api/departments           - Get all departments
```

### **Courses**
```
POST   /api/courses/create        - Create course (admin)
GET    /api/courses               - Get all courses
GET    /api/courses/admin/courses - Get courses for admin dashboard
```

### **Groups**
```
POST   /api/groups/department/:id/create - Create group (admin)
GET    /api/groups                - Get all groups
POST   /api/groups/:id/assign-student    - Add student to group
POST   /api/groups/:id/assign-teacher    - Add teacher to group
```

### **Classrooms** (Teaching Assignments)
```
POST   /api/classroom/create      - Create classroom assignment
GET    /api/classroom/teacher/:id - Get teacher's classrooms
GET    /api/classroom/student/:id - Get student's classrooms
```

### **Classes** (Scheduled Sessions)
```
POST   /api/classes               - Schedule class (teacher)
GET    /api/classes               - Get classes
PUT    /api/classes/:id           - Reschedule class
DELETE /api/classes/:id           - Delete class
POST   /api/classes/:id/location  - Update class location
```

### **Attendance**
```
POST   /api/attendance/mark       - Mark attendance (student)
POST   /api/attendance/open-window    - Open attendance (teacher)
POST   /api/attendance/close-window   - Close attendance (teacher)
POST   /api/attendance/mark-manual    - Manual marking (teacher)
GET    /api/attendance/student/:id    - Get student attendance
GET    /api/attendance/class/:id      - Get class attendance
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "New Class" Button Not Working
**Solution:** Teacher must be assigned to a classroom first
```
Admin → Course Management → Assign Teacher to Course/Group
This creates a "classroom" (teaching assignment)
```

### Issue 2: Signup Network Error (ERR_CONNECTION_REFUSED)
**Solution:** Backend not running
```
cd backend
npm run dev
# Ensure running on http://localhost:5000
```

### Issue 3: Admin Dashboard Stuck on Loading
**Solution:** ✅ Already fixed in previous sessions
- DashboardOverview now renders immediately
- No blocking spinner

### Issue 4: Department Fetch Fails During Signup
**Solution:** ✅ Already fixed
- getDepartments returns empty array on errors
- Signup continues even if departments unavailable

---

## 🎓 Quick Test Flow

**Fastest way to test the system:**

1. **Start servers** (both backend & frontend)
2. **Login as Admin** → Create: Department → Course → Group → Teacher → Student → Assign Teacher
3. **Login as Teacher** → Schedule a class, Open attendance window
4. **Login as Student** → Mark attendance using face recognition

---

## 📱 Key Features by Role

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Create Department | ✅ | ❌ | ❌ |
| Create Course | ✅ | ❌ | ❌ |
| Create Group | ✅ | ❌ | ❌ |
| Schedule Class | ❌ | ✅ | ❌ |
| Open Attendance | ❌ | ✅ | ❌ |
| Mark Attendance | ❌ | ✅ (manual) | ✅ (auto) |
| View Analytics | ✅ | ✅ | ✅ |
| View Attendance | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 🚀 Deployment Notes

**Frontend:** Deployed on Vercel (https://smartattend-rho.vercel.app/)
**Backend:** Deployed on Render (https://project-52z2.onrender.com)

For local development:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📞 Support

For issues, refer to:
- GitHub: https://github.com/ishika2236/SmartAttend
- Author: Ishika Gulati
- LinkedIn: https://www.linkedin.com/in/ishika-gulati-b8a64b249/

---

**Last Updated:** February 25, 2026
**Status:** ✅ All major fixes applied and tested
