import React, { useState } from 'react';
import { Award, BookOpen, Clock, Target, TrendingUp, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export default function StudentDashboard() {
  const { data, updateAcademicRecord, updateGoalProgress } = useData();
  const { user } = useAuth();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [record, setRecord] = useState({ subject: '', score: '' });

  // Real Feeling Data & Progress Animation state
  const [usage, setUsage] = useState(0);
  const [targetUsage, setTargetUsage] = useState(0);
  const limit = 120;

  React.useEffect(() => {
    // Real Feeling Data: Math.random()
    const mockUsage = Math.floor(Math.random() * 120);
    setTargetUsage(mockUsage);
    
    // Smooth delay for WOW animation effect
    const timer = setTimeout(() => {
      setUsage(mockUsage);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Connect Python Auth User to Mock Context User using Email
  const contextUser = data.users.find(u => u.email === user?.email);
  const dataId = contextUser ? contextUser.id : user?.id;

  const myGoals = data.goals.filter(g => g.studentId === dataId);
  const myFeedbacks = data.feedbacks.filter(f => f.studentId === dataId);
  
  const myMarksData = data.academicData.find(a => a.studentId === dataId && a.type === 'marks')?.data || [];
  const myProgressData = data.academicData.find(a => a.studentId === dataId && a.type === 'progressOverTime')?.data || [
    { name: 'W1', score: 0 }
  ];

  const handleAddRecord = (e) => {
    e.preventDefault();
    const updatedMarks = [...myMarksData, { subject: record.subject, score: Number(record.score) }];
    updateAcademicRecord(dataId, 'marks', updatedMarks);
    
    // Auto-update progress over time (mocking a timeline shift)
    const newProgressNode = { name: `W${myProgressData.length + 1}`, score: Number(record.score) };
    updateAcademicRecord(dataId, 'progressOverTime', [...myProgressData, newProgressNode]);

    setRecord({ subject: '', score: '' });
    setIsRecordModalOpen(false);
  };

  const getAverageGrade = () => {
    if (myMarksData.length === 0) return 'N/A';
    const sum = myMarksData.reduce((acc, curr) => acc + curr.score, 0);
    const avg = sum / myMarksData.length;
    if (avg >= 90) return 'A+';
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    return 'D';
  };

  const getMentorName = (mentorId) => {
    return data.users.find(u => u.id === mentorId)?.name || 'Mentor';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Academic Overview</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Curating your path to scholarly excellence, {user?.name}.</p>
          <div className="inline-block mt-3 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              Stay focused. You're doing great 💪
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="hidden md:flex bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 items-center shadow-sm border border-gray-100 dark:border-gray-700/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-3">Success Rate</span>
            <span className="text-xl font-bold text-primary">84%</span>
          </div>
          <button onClick={() => setIsRecordModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Update Marks
          </button>
        </div>
      </div>

      {/* Real Feeling Data & Progress Bar Animation */}
      <div className="card shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-widest">
            <Clock className="text-[#4A90E2]" size={16} /> Today's Focus Tracking
          </h3>
          <div className="animate-pulse text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">LIVE 📊</div>
        </div>
        
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-4xl font-bold tracking-tight text-[#4A90E2]">{targetUsage > 0 ? usage : 0}</span>
            <span className="text-sm font-medium text-gray-500 ml-1">mins</span>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{limit}m Target</span>
        </div>
        
        <div className="w-full h-[6px] bg-[#eee] dark:bg-gray-700 rounded-[10px] overflow-hidden relative">
          <div 
            className="h-full bg-[#4A90E2] rounded-[10px] transition-all ease-out shadow-[0_0_10px_rgba(74,144,226,0.6)]"
            style={{ 
              width: `${(usage / limit) * 100}%`,
              transitionDuration: '1500ms'
            }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-primary text-white border-0 shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col justify-center">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
            <Award size={120} />
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 translate-y-10" />
          
          <div className="relative z-10">
            <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-2">Average Grade</p>
            <h2 className="text-5xl font-bold tracking-tight mb-4">{getAverageGrade()}</h2>
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              You've maintained excellent academic standing. Keep the momentum!
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <TrendingUp size={14} />
              <span>Based on {myMarksData.length} records</span>
            </div>
          </div>
        </div>
        
        <div className="card md:col-span-3">
          <h3 className="text-lg font-semibold mb-4">Performance Timeline</h3>
          <div className="h-40 w-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={myProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} dot={{ strokeWidth: 3, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b dark:border-gray-700/50">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Target className="text-emerald-500" size={20} /> My Goals</h3>
          </div>
          <div className="space-y-4">
            {myGoals.map(goal => (
              <div key={goal.id} className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {goal.progress === 100 ? 'Completed' : 'High Priority'}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{goal.title}</h4>
                  </div>
                  <span className={`badge ${goal.progress === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 'bg-primary/10 text-primary dark:bg-primary/20'}`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl mb-4 border border-gray-100 dark:border-gray-700/50 text-sm text-gray-500 italic">
                  Focus on completion before the next mentoring session.
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1 text-xs font-bold text-gray-400">
                      <span>PROGRESS</span>
                      <span className="text-primary">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex-1">
                      <div className={`h-2 rounded-full transition-all ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>
                  <select 
                    className="input-field !py-0.5 !px-1 h-6 text-xs w-16"
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                  >
                    {[0, 25, 50, 75, 100].map(val => (
                      <option key={val} value={val}>{val}%</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {myGoals.length === 0 && <p className="text-gray-500 text-sm italic">No goals assigned yet.</p>}
          </div>
        </div>
        
        <div className="card h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b dark:border-gray-700/50">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Clock className="text-purple-500" size={20} /> Mentor Feedback</h3>
          </div>
          <div className="space-y-4">
            {myFeedbacks.sort((a,b) => new Date(b.date) - new Date(a.date)).map(feedback => (
              <div key={feedback.id} className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl relative shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                    {getMentorName(feedback.mentorId)[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{getMentorName(feedback.mentorId)}</p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{new Date(feedback.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-xl">"{feedback.text}"</p>
              </div>
            ))}
            {myFeedbacks.length === 0 && <p className="text-gray-500 text-sm italic">No feedback received yet.</p>}
          </div>
        </div>
      </div>

      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Add Academic Record">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject / Module Name</label>
            <input required type="text" className="input-field" value={record.subject} onChange={e => setRecord({...record, subject: e.target.value})} placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Score / Percentage</label>
            <input required type="number" min="0" max="100" className="input-field" value={record.score} onChange={e => setRecord({...record, score: e.target.value})} placeholder="85" />
          </div>
          <button type="submit" className="btn-primary w-full mt-4">Save Record</button>
        </form>
      </Modal>

    </div>
  );
}
