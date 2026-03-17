import { createAsyncThunk } from '@reduxjs/toolkit';
import emailService from './emailService';

export const fetchEmailStatus = createAsyncThunk(
  'email/fetchStatus',
  async (_, thunkAPI) => {
    try {
      return await emailService.getEmailStatus();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch email status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendAttendanceReportEmail = createAsyncThunk(
  'email/sendAttendanceReportEmail',
  async (payload, thunkAPI) => {
    try {
      return await emailService.sendAttendanceReport(payload);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send attendance report';
      return thunkAPI.rejectWithValue(message);
    }
  }
);