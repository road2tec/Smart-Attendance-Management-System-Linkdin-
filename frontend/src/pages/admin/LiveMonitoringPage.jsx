import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, RefreshCw, Timer } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { useTheme } from '../../context/ThemeProvider';

const API_URL = `${import.meta.env.VITE_API_URL}/logs/live`;
const ALERT_API_URL = `${import.meta.env.VITE_API_URL}/logs/alerts/check`;

const LiveMonitoringPage = () => {
  const { themeConfig, theme, isDark } = useTheme();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [eventMinutes, setEventMinutes] = useState(30);
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [alertState, setAlertState] = useState(null);
  const [isAlertChecking, setIsAlertChecking] = useState(false);
  const [isSendingAlertEmail, setIsSendingAlertEmail] = useState(false);

  const fetchLiveData = async () => {
    try {
      setError('');
      const response = await axiosInstance.get(`${API_URL}?eventMinutes=${eventMinutes}&limit=120`);
      setData(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load live monitoring data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAlertStatus = async ({ sendEmail = false } = {}) => {
    try {
      if (sendEmail) {
        setIsSendingAlertEmail(true);
      } else {
        setIsAlertChecking(true);
      }

      const response = await axiosInstance.get(
        `${ALERT_API_URL}?windowMinutes=${eventMinutes}&threshold=${alertThreshold}&sendEmail=${sendEmail ? 'true' : 'false'}`
      );
      setAlertState(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to check alert status');
    } finally {
      setIsAlertChecking(false);
      setIsSendingAlertEmail(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchLiveData();
    checkAlertStatus();
  }, [eventMinutes]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = setInterval(() => {
      fetchLiveData();
      checkAlertStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, eventMinutes, alertThreshold]);

  const activeWindows = data?.activeWindows || [];
  const recentEvents = data?.recentEvents || [];

  const liveSummary = useMemo(() => {
    const totalMarkedInActive = activeWindows.reduce((acc, item) => acc + (item.attendanceMarked || 0), 0);
    const totalAssignedInActive = activeWindows.reduce((acc, item) => acc + (item.totalAssignedStudents || 0), 0);
    const failedInActive = activeWindows.reduce((acc, item) => acc + (item.failedFaceAttempts || 0), 0);
    const progress = totalAssignedInActive > 0 ? Math.round((totalMarkedInActive / totalAssignedInActive) * 100) : 0;

    return {
      totalMarkedInActive,
      totalAssignedInActive,
      failedInActive,
      progress,
    };
  }, [activeWindows]);

  return (
    <div className={`min-h-screen p-6 ${themeConfig[theme].gradientBackground}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${themeConfig[theme].text}`}>Live Monitoring</h1>
            <p className={themeConfig[theme].secondaryText}>Real-time attendance windows and recent activity stream.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm ${themeConfig[theme].secondaryText}`}>Window</label>
            <select
              value={eventMinutes}
              onChange={(e) => setEventMinutes(Number(e.target.value))}
              className={`rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
            <button
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`px-3 py-2 rounded-lg text-sm ${autoRefresh ? (isDark ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-700') : (isDark ? 'bg-[#1E2733] text-gray-300' : 'bg-slate-100 text-slate-700')}`}
            >
              {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
            </button>
            <button
              onClick={fetchLiveData}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className={`${themeConfig[theme].card} rounded-xl p-4 flex flex-wrap items-center gap-3`}>
          <span className={`text-sm font-medium ${themeConfig[theme].text}`}>Unknown Attempt Alert</span>
          <label className={`text-sm ${themeConfig[theme].secondaryText}`}>Threshold</label>
          <input
            type="number"
            min={1}
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value) || 1)}
            className={`w-20 rounded-lg px-2 py-1 text-sm ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
          />
          <button
            onClick={() => checkAlertStatus({ sendEmail: false })}
            className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            disabled={isAlertChecking}
          >
            {isAlertChecking ? 'Checking...' : 'Check Alert'}
          </button>
          <button
            onClick={() => checkAlertStatus({ sendEmail: true })}
            className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-red-700 text-red-100 hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
            disabled={isSendingAlertEmail}
          >
            {isSendingAlertEmail ? 'Sending...' : 'Send Alert Email'}
          </button>
          {alertState && (
            <span className={`text-xs ${alertState.triggered ? (isDark ? 'text-red-400' : 'text-red-600') : themeConfig[theme].secondaryText}`}>
              Last check: {alertState.unknownCount} unknown in {alertState.windowMinutes} min (threshold {alertState.threshold})
            </span>
          )}
        </div>

        {alertState?.triggered && (
          <div className={`rounded-xl p-4 border ${isDark ? 'border-red-700 bg-red-900/20 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <div className="font-semibold">⚠ Security Alert Triggered</div>
            <div className="text-sm mt-1">
              {alertState.unknownCount} unknown recognition attempts detected in last {alertState.windowMinutes} minutes (threshold: {alertState.threshold}).
            </div>
            {alertState.email?.attempted && (
              <div className="text-xs mt-1">
                Email status: {alertState.email.sent ? 'sent' : 'not sent'} {alertState.email.message ? `- ${alertState.email.message}` : ''}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={themeConfig[theme].secondaryText}>Active Windows</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{data?.activeWindowCount || 0}</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Timer size={16} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={themeConfig[theme].secondaryText}>Marked / Assigned</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{liveSummary.totalMarkedInActive} / {liveSummary.totalAssignedInActive}</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span className={themeConfig[theme].secondaryText}>Progress</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{liveSummary.progress}%</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className={isDark ? 'text-red-400' : 'text-red-600'} />
              <span className={themeConfig[theme].secondaryText}>Failed Faces (Active)</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{liveSummary.failedInActive}</p>
          </div>
        </div>

        {error && (
          <div className={`rounded-xl p-4 border ${isDark ? 'border-red-800 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}

        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeConfig[theme].text}`}>Active Attendance Windows</h2>
          {isLoading && !data ? (
            <p className={themeConfig[theme].secondaryText}>Loading live windows...</p>
          ) : activeWindows.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>No attendance window is currently open.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Opened</th>
                    <th className="px-4 py-3 text-left">Closes</th>
                    <th className="px-4 py-3 text-left">Marked</th>
                    <th className="px-4 py-3 text-left">Failed Face</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWindows.map((windowItem) => (
                    <tr key={`${windowItem.classroomId}-${windowItem.classId}`} className={isDark ? 'border-b border-[#1E2733]' : 'border-b border-slate-200'}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{windowItem.classTitle}</div>
                        <div className={`text-xs ${themeConfig[theme].secondaryText}`}>
                          {windowItem.course?.courseName} ({windowItem.course?.courseCode}) • {windowItem.group?.name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">{windowItem.teacher ? `${windowItem.teacher.firstName} ${windowItem.teacher.lastName}` : '-'}</td>
                      <td className="px-4 py-3">{windowItem.openedAt ? new Date(windowItem.openedAt).toLocaleTimeString() : '-'}</td>
                      <td className="px-4 py-3">{windowItem.closesAt ? new Date(windowItem.closesAt).toLocaleTimeString() : 'No limit'}</td>
                      <td className="px-4 py-3 font-medium">{windowItem.attendanceMarked} / {windowItem.totalAssignedStudents}</td>
                      <td className={`px-4 py-3 font-medium ${windowItem.failedFaceAttempts > 0 ? (isDark ? 'text-red-400' : 'text-red-600') : ''}`}>
                        {windowItem.failedFaceAttempts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeConfig[theme].text}`}>Recent Activity ({data?.eventWindowMinutes || eventMinutes} min)</h2>
          {recentEvents.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>No recent attendance events.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Face</th>
                    <th className="px-4 py-3 text-left">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((eventItem) => (
                    <tr key={eventItem._id} className={isDark ? 'border-b border-[#1E2733]' : 'border-b border-slate-200'}>
                      <td className="px-4 py-3 whitespace-nowrap">{eventItem.markedAt ? new Date(eventItem.markedAt).toLocaleTimeString() : '-'}</td>
                      <td className="px-4 py-3">{eventItem.student ? `${eventItem.student.firstName} ${eventItem.student.lastName}` : '-'}</td>
                      <td className="px-4 py-3">{eventItem.class?.title || eventItem.classroom?.course?.courseCode || '-'}</td>
                      <td className="px-4 py-3 capitalize">{eventItem.status}</td>
                      <td className={`px-4 py-3 font-medium ${eventItem.faceRecognized === false ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`}>
                        {eventItem.faceRecognized === false ? 'Failed' : 'Matched'}
                      </td>
                      <td className="px-4 py-3 capitalize">{eventItem.markedBy || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;
