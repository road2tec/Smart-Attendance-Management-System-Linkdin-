# 🚀 SmartAttend - Quick Start Guide

## ⚡ 30-Second Setup
```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend  
cd frontend && npm run dev

# Open: http://localhost:5173
```

---

## 👥 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mail.com | 123456Aa |
| Teacher | testteacher@gmail.com | Aa123456 |
| Student | test123@gmail.com | Aa123456 |

---

## 📋 Complete Workflow (15 minutes)

### ✅ STEP 1: ADMIN SETUP (5 minutes)
**Login:** admin@mail.com / 123456Aa

```
1. Department Management
   → "Create Department"
   → Name: "Computer Science"
   → Save ✅

2. Course Management
   → "Create Course"
   → Name: "Data Structures"
   → Department: "Computer Science"
   → Save ✅

3. Group Management
   → "Create Group"
   → Name: "CSE-2A"
   → Department: "Computer Science"
   → Save ✅

4. Enrolled Users → Add Teacher
   → Name: John Doe
   → Email: john@example.com
   → Password: Secure123
   → Save ✅

5. Enrolled Users → Add Student
   → Name: Jane Smith
   → Email: jane@example.com
   → Roll: 1001
   → Group: CSE-2A
   → Save ✅

6. Course Management → Assign Teacher
   → Select Course: Data Structures
   → Select Teacher: John Doe
   → Select Group: CSE-2A
   → Assign ✅
```

---

### ✅ STEP 2: TEACHER WORKFLOW (5 minutes)
**Login:** john@example.com / Secure123

```
1. Classes → "New Class" Button
   
2. Fill Form:
   - Title: "Lecture 1"
   - Course: Data Structures (auto-filled)
   - Start Date: Tomorrow
   - End Date: In 3 months
   - Days: Monday, Wednesday, Friday
   - Time: 10:00 AM - 11:30 AM
   
3. Click "Schedule" ✅

4. Class appears in list

5. Click Class → "Open Attendance Window"
   → Status changes to ACTIVE ✅
```

---

### ✅ STEP 3: STUDENT WORKFLOW (5 minutes)
**Login:** jane@example.com / Aa123456

```
1. Dashboard → Classrooms

2. See "Data Structures" class
   → Status: ACTIVE (window open)
   → Click "Mark Attendance"

3. Camera Opens
   → Allow permission
   → Face detection scans
   → Location check
   → Click "Submit"

4. Attendance Marked ✅

5. View in "Attendance" section
   → Attendance recorded
   → History visible
```

---

## 🎯 Key Actions

### For ADMIN:
- ➕ Create Department
- ➕ Create Course  
- ➕ Create Group
- 👤 Register Teacher
- 👥 Register Student
- 🔗 Assign Teacher to Course
- 📊 View Analytics

### For TEACHER:
- 📅 Schedule Class
- 🪟 Open/Close Attendance Window
- ✅ Mark Attendance (Manual)
- 📁 Share Materials
- 📝 Update Class Info

### For STUDENT:
- 📋 View Classes
- 📸 Mark Attendance (Face Recognition)
- 📍 Location Verification
- 📊 View Attendance History
- 📚 Access Materials

---

## ❌ Common Problems & Solutions

### Problem: "New Class button not working"
```
❌ Teacher not assigned to classroom
✅ Solution: Admin must assign teacher to course/group first
```

### Problem: "Backend not responding"
```
❌ Backend server not running
✅ Solution: 
   cd backend
   npm run dev
```

### Problem: "Signup network error"
```
❌ Ports mismatch or backend down
✅ Solution:
   - Backend: localhost:5000
   - Frontend: localhost:5173
   - Both running? Check terminal
```

### Problem: "Admin dashboard stuck loading"
```
❌ Duplicate data fetching in components
✅ Solution: Already fixed in recent updates
```

---

## 🔐 Authentication Flow

```
1. User enters email & password
2. Frontend sends POST /api/auth/login
3. Backend validates & returns JWT token
4. Token stored in localStorage
5. axiosInstance includes token in all requests
6. Protected routes check if authenticated
```

---

## 📱 Database Schema Overview

### Users Collection
```javascript
{
  _id: ObjectId,
  firstName, lastName,
  email (unique),
  password (hashed),
  role: ['admin', 'teacher', 'student'],
  mobile, dateOfBirth,
  addresses,
  profileImage,
  faceEmbedding (for facial recognition)
}
```

### Departments Collection
```javascript
{
  _id: ObjectId,
  name: "Computer Science",
  description,
  createdAt
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  courseName: "Data Structures",
  courseCode: "CS101",
  department: ObjectId,
  description,
  credits
}
```

### Classes Collection
```javascript
{
  _id: ObjectId,
  title: "Lecture 1",
  course: ObjectId,
  teacher: ObjectId,
  groups: [ObjectId],
  schedule: {
    daysOfWeek, startTime, endTime,
    startDate, endDate
  },
  isExtraClass,
  extraClassDate,
  location: { latitude, longitude }
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  class: ObjectId,
  student: ObjectId,
  status: ['present', 'absent', 'late'],
  markedAt,
  faceRecognitionMatch: percentage,
  locationVerified: boolean
}
```

---

## 🌐 API Endpoints Cheat Sheet

### Auth
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/departments
```

### Data Management
```
POST   /api/departments/create
POST   /api/courses/create
POST   /api/groups/department/:id/create
POST   /api/classroom/create
```

### Classes
```
POST   /api/classes (schedule)
GET    /api/classes
PUT    /api/classes/:id (reschedule)
DELETE /api/classes/:id
```

### Attendance
```
POST   /api/attendance/mark (student)
POST   /api/attendance/open-window (teacher)
POST   /api/attendance/close-window (teacher)
POST   /api/attendance/mark-manual (teacher)
GET    /api/attendance/student/:id
GET    /api/attendance/class/:id
```

---

## 🎨 Theme System

```javascript
// Light Theme
- Background: white/light gray
- Text: dark gray/black
- Buttons: blue gradient

// Dark Theme
- Background: dark gray/navy
- Text: white/light gray
- Buttons: blue with dark background
```

Both themes applied automatically. Toggle with moon/sun icon.

---

## 📊 Redux State Structure

```
auth/
  - user, token, isAuthenticated, isLoading
  - departments, roles

courses/
  - courses, loading, error

groups/
  - groups, loading, error

classrooms/
  - teacherClassrooms, studentClassrooms

classes/
  - classes, loading, isSuccess, isError

attendance/
  - attendanceRecords, loading, error
```

---

## 🔒 Security Features

✅ **JWT Authentication**
- Token stored in localStorage
- Expires after set time
- Refresh mechanism available

✅ **Role-Based Access Control**
- Admin-only endpoints
- Teacher-only endpoints
- Student-only endpoints

✅ **CORS Enabled**
- Whitelist specific frontend domains
- Prevent unauthorized access

✅ **Password Hashing**
- bcrypt used for password storage
- Plain passwords never stored

✅ **Facial Recognition**
- Face embeddings stored
- Comparison done on server
- Location verification required

---

## 🚀 Next Steps

1. ✅ Run both servers
2. ✅ Test all 3 roles
3. ✅ Create sample data (Department/Course/Group/Users)
4. ✅ Schedule a class
5. ✅ Mark attendance
6. ✅ View analytics

---

**Happy Testing! 🎉**

For detailed info, see `PROJECT_ANALYSIS.md`
