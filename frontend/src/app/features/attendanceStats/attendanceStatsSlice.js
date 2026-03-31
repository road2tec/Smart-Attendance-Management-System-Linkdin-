import { createSlice } from '@reduxjs/toolkit';
import { getMyAttendance, getStudentAttendance, getClassAttendance, getClassroomAttendance, getTeacherAttendance, getOverallAttendance, getDailyAttendanceReport, getMonthlyAttendanceReport, getStudentTrends, getDefaultersList } from './attendanceStatsThunks';

// Initial state
const initialState = {
  studentAttendance: null,
  studentTrends: null,
  classAttendance: null,
  classroomAttendance: null,
  teacherAttendance: null,
  overallAttendance: null,
  defaultersList: null,
  dailyReport: null,
  monthlyReport: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Async thunks

// Create slice
const attendanceStatsSlice = createSlice({
  name: 'attendanceStats',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearAttendanceData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    const beginRequest = (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    };

    const completeRequest = (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.message = '';
    };

    const failRequest = (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;
      state.message = action.payload || 'Something went wrong';
    };

    builder
      // getMyAttendance
      .addCase(getMyAttendance.pending, beginRequest)
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        completeRequest(state);
        state.studentAttendance = action.payload.data;
      })
      .addCase(getMyAttendance.rejected, failRequest)
      
      // getStudentTrends
      .addCase(getStudentTrends.pending, beginRequest)
      .addCase(getStudentTrends.fulfilled, (state, action) => {
        completeRequest(state);
        state.studentTrends = action.payload.data;
      })
      .addCase(getStudentTrends.rejected, failRequest)

      // getStudentAttendance
      .addCase(getStudentAttendance.pending, beginRequest)
      .addCase(getStudentAttendance.fulfilled, (state, action) => {
        completeRequest(state);
        state.studentAttendance = action.payload.data;
      })
      .addCase(getStudentAttendance.rejected, failRequest)
      
      // getClassAttendance
      .addCase(getClassAttendance.pending, beginRequest)
      .addCase(getClassAttendance.fulfilled, (state, action) => {
        completeRequest(state);
        state.classAttendance = action.payload.data;
      })
      .addCase(getClassAttendance.rejected, failRequest)
      
      // getClassroomAttendance
      .addCase(getClassroomAttendance.pending, beginRequest)
      .addCase(getClassroomAttendance.fulfilled, (state, action) => {
        completeRequest(state);
        state.classroomAttendance = action.payload.data;
      })
      .addCase(getClassroomAttendance.rejected, failRequest)
      
      // getTeacherAttendance
      .addCase(getTeacherAttendance.pending, beginRequest)
      .addCase(getTeacherAttendance.fulfilled, (state, action) => {
        completeRequest(state);
        state.teacherAttendance = action.payload.data;
      })
      .addCase(getTeacherAttendance.rejected, failRequest)
      
      // getOverallAttendance
      .addCase(getOverallAttendance.pending, beginRequest)
      .addCase(getOverallAttendance.fulfilled, (state, action) => {
        completeRequest(state);
        state.overallAttendance = action.payload.data;
      })
      .addCase(getOverallAttendance.rejected, failRequest)

      // getDefaultersList
      .addCase(getDefaultersList.pending, beginRequest)
      .addCase(getDefaultersList.fulfilled, (state, action) => {
        completeRequest(state);
        state.defaultersList = action.payload.data;
      })
      .addCase(getDefaultersList.rejected, failRequest)
      
      // getDailyAttendanceReport
      .addCase(getDailyAttendanceReport.pending, beginRequest)
      .addCase(getDailyAttendanceReport.fulfilled, (state, action) => {
        completeRequest(state);
        state.dailyReport = action.payload.data;
      })
      .addCase(getDailyAttendanceReport.rejected, failRequest)
      
      // getMonthlyAttendanceReport
      .addCase(getMonthlyAttendanceReport.pending, beginRequest)
      .addCase(getMonthlyAttendanceReport.fulfilled, (state, action) => {
        completeRequest(state);
        state.monthlyReport = action.payload.data;
      })
      .addCase(getMonthlyAttendanceReport.rejected, failRequest);
  },
});

export const { reset, clearAttendanceData } = attendanceStatsSlice.actions;
export default attendanceStatsSlice.reducer;