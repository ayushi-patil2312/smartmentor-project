import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../../context/DataContext';

export default function ReportsPage() {
  const { data } = useData();
  
  // Try to gather all marks across students to create a report
  const allMarks = data.academicData.filter(d => d.type === 'marks');
  
  // Re-format for the chart: calculate average score per subject across all students
  const mapData = () => {
    let subjectScores = {};
    let subjectCounts = {};
    
    allMarks.forEach(studentRecord => {
      studentRecord.data.forEach(mark => {
        if(!subjectScores[mark.subject]) {
          subjectScores[mark.subject] = 0;
          subjectCounts[mark.subject] = 0;
        }
        subjectScores[mark.subject] += mark.score;
        subjectCounts[mark.subject] += 1;
      });
    });

    const formattedData = Object.keys(subjectScores).map(subject => ({
      name: subject,
      "Average Score": Math.round(subjectScores[subject] / subjectCounts[subject])
    }));
    
    return formattedData.length > 0 ? formattedData : [{ name: 'No Data Yet', "Average Score": 0 }];
  };

  const chartData = mapData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1 block">Performance Overview</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">A comprehensive look at your academic journey, session consistency, and goal progression.</p>
        </div>
        <button className="btn-primary self-start md:self-auto flex items-center gap-2 h-12 px-6" onClick={() => window.print()}>
          ↓ Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Over Time</h3>
              <p className="text-xs text-gray-500 font-medium">GPA and test score trends across 6 months</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <span className="px-3 py-1 text-xs font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded shadow-sm">6M</span>
              <span className="px-3 py-1 text-xs font-bold text-gray-500">1Y</span>
              <span className="px-3 py-1 text-xs font-bold text-gray-500">ALL</span>
            </div>
          </div>
          <div className="w-full h-[300px]">
            {chartData && chartData.length > 0 && chartData[0].name !== 'No Data Yet' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="Average Score" fill="#5A67D8" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-gray-500 italic text-sm">No data available</p>
                </div>
            )}
          </div>
        </div>

        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Attendance Tracking</h3>
            <p className="text-xs text-gray-500 font-medium">Mentorship Session Consistency</p>
          </div>
          
          <div className="relative flex justify-center items-center my-6">
            <div className="w-48 h-48 rounded-full border-[12px] border-emerald-500 flex justify-center items-center relative z-10 bg-white dark:bg-gray-800">
              <div className="text-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">94%</span>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Attended</span>
              </div>
            </div>
            <div className="absolute w-48 h-48 rounded-full border-[12px] border-gray-100 dark:border-gray-700 z-0" />
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Attended</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Missed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-start gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex justify-center items-center text-primary flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mentor Feedback</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">"Significant improvement in abstract reasoning since our last deep-dive."</p>
            <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1">— Dr. Sarah Jenkins</p>
          </div>
        </div>

        <div className="card flex items-start gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex justify-center items-center text-emerald-500 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Study Velocity</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2">42.5 hours logged this week. 12% increase compared to last month.</p>
            <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">↗ On track for finals</p>
          </div>
        </div>

        <div className="card flex items-start gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex justify-center items-center text-purple-500 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v5s3-2 6-2 6 2 6 2v-5"/><path d="M12 15h0a3 3 0 1 1-6 0v-5"/><path d="M6 10h0a3 3 0 1 1-6 0v-5"/><path d="M18 10h0a3 3 0 1 1-6 0v-5"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skill Proficiency</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">PYTHON L3</span>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">CALCULUS L5</span>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">LOGIC L4</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
