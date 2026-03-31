// redux/thunks/userThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import userService from './userService';

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAllUsers();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch teachers only
export const fetchTeachers = createAsyncThunk(
  'users/fetchTeachers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await  userService.getTeachers();
        // console.log(response.students);
      return response.teachers; 
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch students only
export const fetchStudents = createAsyncThunk(
  'users/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
        const response = await  userService.getStudents();
        // console.log(response.students);
      return response.students; 
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.getUserById(userId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(userId, userData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Fetch pending users
export const fetchPendingUsers = createAsyncThunk(
  'users/fetchPendingUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getPendingUsers();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Update user status
export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      return await userService.updateUserStatus(userId, status);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await userService.deleteUser(userId);
      // Optional: Since users scale up, we re-fetch instead of manual array filter to keep pagination accurate
      dispatch(fetchStudents()); 
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);