import axiosInstance from '../../../utils/axiosInstance';

const API_URL = `${import.meta.env.VITE_API_URL}/results`;

const getTeacherResults = async (classroomId) => {
  const query = classroomId ? `?classroomId=${classroomId}` : '';
  const response = await axiosInstance.get(`${API_URL}/teacher/me${query}`);
  return response.data;
};

const getMyResults = async () => {
  const response = await axiosInstance.get(`${API_URL}/student/me`);
  return response.data;
};

const saveClassroomResults = async ({ classroomId, payload }) => {
  const response = await axiosInstance.post(`${API_URL}/classroom/${classroomId}`, payload);
  return response.data;
};

const adminGetAllResults = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.classroomId) query.append('classroomId', params.classroomId);
  if (params.courseId) query.append('courseId', params.courseId);
  if (params.examType) query.append('examType', params.examType);
  const qs = query.toString() ? `?${query.toString()}` : '';
  const response = await axiosInstance.get(`${API_URL}/admin/all${qs}`);
  return response.data;
};

const resultsService = {
  getTeacherResults,
  getMyResults,
  saveClassroomResults,
  adminGetAllResults,
};

export default resultsService;