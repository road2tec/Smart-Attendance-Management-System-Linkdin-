import axiosInstance from '../../../utils/axiosInstance';

const API_URL = `${import.meta.env.VITE_API_URL}/email`;

const getEmailStatus = async () => {
  const response = await axiosInstance.get(`${API_URL}/status`);
  return response.data;
};

const sendAttendanceReport = async (payload) => {
  const response = await axiosInstance.post(`${API_URL}/attendance-report`, payload);
  return response.data;
};

const emailService = {
  getEmailStatus,
  sendAttendanceReport,
};

export default emailService;