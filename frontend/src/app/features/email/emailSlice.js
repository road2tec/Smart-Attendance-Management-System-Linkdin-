import { createSlice } from '@reduxjs/toolkit';
import { fetchEmailStatus, sendAttendanceReportEmail } from './emailThunks';

const initialState = {
  status: null,
  lastSentReport: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    resetEmailStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailStatus.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchEmailStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.data;
      })
      .addCase(fetchEmailStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendAttendanceReportEmail.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(sendAttendanceReportEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.lastSentReport = action.payload.data;
      })
      .addCase(sendAttendanceReportEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetEmailStatus } = emailSlice.actions;
export default emailSlice.reducer;