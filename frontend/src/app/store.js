// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './features/courses/courseSlice';
import groupReducer from './features/groups/groupSlice';
import userReducer from './features/users/userSlice';
import departmentReducer from './features/departments/departmentSlice';
import authReducer from './features/auth/authSlice';
import classReducer from './features/class/classSlice'
import classroomReducer from './features/classroom/classroomSlice';
import attendanceReducer from './features/attendance/attendanceSlice'
import attendanceStatsReducer from './features/attendanceStats/attendanceStatsSlice'
import resultsReducer from './features/results/resultsSlice';
import emailReducer from './features/email/emailSlice';
import logsReducer from './features/logs/logsSlice';
// Configure store without navigation middleware initially
const store = configureStore({
  reducer: {
    courses: courseReducer,
    groups: groupReducer,
    users: userReducer,
    departments: departmentReducer,
    auth: authReducer,
    classes: classReducer,
    classrooms : classroomReducer,
    attendance: attendanceReducer,
    attendanceStats : attendanceStatsReducer,
    results: resultsReducer,
    email: emailReducer,
    logs: logsReducer,
  },
});



export default store;