import React from 'react';
import { CalendarCheck, BarChart2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AttendanceCharts({ attendanceData, groupAttendanceData, isDark }) {
  const courseAverage = attendanceData.length
    ? Math.round(attendanceData.reduce((sum, item) => sum + Number(item.attendance || 0), 0) / attendanceData.length)
    : 0;
  const groupAverage = groupAttendanceData.length
    ? Math.round(groupAttendanceData.reduce((sum, item) => sum + Number(item.attendance || 0), 0) / groupAttendanceData.length)
    : 0;

  const ChartContainer = ({ title, subtitle, average, icon: Icon, data, dataKey, color, isDark }) => (
    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#1E2733]/20 border-[#1E2733]' : 'bg-gray-50/30 border-gray-100'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl flex items-center gap-4 border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{average}%</div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Score</div>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#eee'} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
            />
            <Tooltip 
              cursor={{ fill: isDark ? '#1E2733' : '#f8fafc', radius: 12 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-[#0A0E13]/90 border-[#1E2733]' : 'bg-white/90 border-gray-100'}`}>
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].payload.name}</p>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                         <p className="text-[10px] font-bold text-brand-primary uppercase">{payload[0].value}% Participation</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey={dataKey} 
              radius={[10, 10, 10, 10]}
              barSize={32}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color} 
                  fillOpacity={0.8}
                  className="hover:fill-opacity-100 transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Telemetry Synchronized</span>
         </div>
         <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Last Batch: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
         </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <ChartContainer
        title="Syllabus Compliance"
        subtitle="Institutional attendance velocity by course"
        average={courseAverage}
        icon={CalendarCheck}
        data={attendanceData}
        dataKey="attendance"
        color="#2E67FF"
        isDark={isDark}
      />

      <ChartContainer
        title="Cohort Performance"
        subtitle="Engagement metrics segmented by student groups"
        average={groupAverage}
        icon={BarChart2}
        data={groupAttendanceData}
        dataKey="attendance"
        color="#F2683C"
        isDark={isDark}
      />
    </div>
  );
}