import { createAsyncThunk } from '@reduxjs/toolkit';
import resultsService from './resultsService';

export const fetchTeacherResults = createAsyncThunk(
  'results/fetchTeacherResults',
  async (classroomId, thunkAPI) => {
    try {
      return await resultsService.getTeacherResults(classroomId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch teacher results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMyResults = createAsyncThunk(
  'results/fetchMyResults',
  async (_, thunkAPI) => {
    try {
      return await resultsService.getMyResults();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch student results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const saveTeacherResults = createAsyncThunk(
  'results/saveTeacherResults',
  async ({ classroomId, payload }, thunkAPI) => {
    try {
      return await resultsService.saveClassroomResults({ classroomId, payload });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to save results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const adminFetchAllResults = createAsyncThunk(
  'results/adminFetchAllResults',
  async (params = {}, thunkAPI) => {
    try {
      return await resultsService.adminGetAllResults(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch admin results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);