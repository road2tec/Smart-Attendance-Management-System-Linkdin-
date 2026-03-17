import { createSlice } from '@reduxjs/toolkit';
import { adminFetchAllResults, fetchMyResults, fetchTeacherResults, saveTeacherResults } from './resultsThunks';

const initialState = {
  teacherResults: [],
  studentResults: [],
  adminResults: [],
  adminResultsTotal: 0,
  adminResultsSummary: null,
  teacherSummary: null,
  studentSummary: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    resetResultsStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchTeacherResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.teacherResults = action.payload.data?.results || [];
        state.teacherSummary = action.payload.data?.summary || null;
      })
      .addCase(fetchTeacherResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchMyResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMyResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.studentResults = action.payload.data?.results || [];
        state.studentSummary = action.payload.data?.summary || null;
      })
      .addCase(fetchMyResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(saveTeacherResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(saveTeacherResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Results saved successfully';
      })
      .addCase(saveTeacherResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(adminFetchAllResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(adminFetchAllResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminResults = action.payload.data?.results || [];
        state.adminResultsTotal = action.payload.total || 0;
        state.adminResultsSummary = action.payload.data?.summary || null;
      })
      .addCase(adminFetchAllResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetResultsStatus } = resultsSlice.actions;
export default resultsSlice.reducer;