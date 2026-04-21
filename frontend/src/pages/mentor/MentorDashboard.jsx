import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Download, Flag, UserPlus, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../api';

export default function MentorDashboard() {
  const { addFeedback, addGoal } = useData();
  const { user } = useAuth();

  const [selectedStudent, setSelectedStudent] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [goal, setGoal] = useState({ title: '' });

  const [myStudents, setMyStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    if (!user?.id) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/my-students/${user.id}`);
      const data = await res.json();
      setMyStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await addFeedback({
      studentId: Number(selectedStudent),
      mentorId: user?.id,
      text: feedbackText,
      rating: Number(feedbackRating),
    });
    setFeedbackText('');
    setFeedbackRating(5);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !goal.title) return;
    await addGoal({ studentId: Number(selectedStudent), title: goal.title });
    setGoal({ title: '' });
  };

  const avgScore = (marks) => {
    if (!Array.isArray(marks) || marks.length === 0) return null;
    return Math.round(marks.reduce((a, m) => a + (Number(m.score) || 0), 0) / marks.length);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">Overview</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Active Mentorships</h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-500">
            You are currently guiding {myStudents.length} student{myStudents.length === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary flex items-center gap-2"><Download size={15} /> Export</button>
          <button className="btn-primary flex items-center gap-2"><UserPlus size={15} /> View My Students</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="card md:col-span-2 lg:col-span-3 text-gray-500">Loading your students...</div>
        ) : myStudents.length === 0 ? (
          <div className="card md:col-span-2 lg:col-span-3 text-center py-10">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-gray-500">No students assigned yet.</p>
          </div>
        ) : myStudents.map((student) => {
          const avg = avgScore(student.marks);
          return (
            <div key={student.id} className="card flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg flex items-center justify-center">
                  {student.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{student.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{student.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-[10px] uppercase text-gray-400">Attend</p>
                  <p className="text-base font-bold">{student.attendance != null ? `${student.attendance}%` : '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-[10px] uppercase text-gray-400">Avg</p>
                  <p className="text-base font-bold">{avg ?? '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-[10px] uppercase text-gray-400">Hours</p>
                  <p className="text-base font-bold">{student.study_hours ?? '—'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Assign Academic Goal</h2>
              <p className="mt-1 text-sm text-gray-500">Define a target for one of your students.</p>
            </div>
            <Flag size={16} className="mt-2 text-gray-300" />
          </div>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Student</label>
              <select required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="input-field">
                <option value="">Select student</option>
                {myStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Goal</label>
              <input required type="text" className="input-field" placeholder="e.g. Finish Algorithms module"
                value={goal.title} onChange={(e) => setGoal({ title: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full">Publish Goal</button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Quick Feedback</h2>
          <p className="mt-1 text-sm text-gray-500">Submit feedback for a student.</p>
          <form onSubmit={handleAddFeedback} className="space-y-3 mt-4">
            <select required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="input-field">
              <option value="">Select student</option>
              {myStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <textarea required className="input-field min-h-[100px]" placeholder="How did they do today?"
              value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
            <select className="input-field" value={feedbackRating} onChange={(e) => setFeedbackRating(e.target.value)}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <button type="submit" className="btn-primary w-full">Send Feedback</button>
          </form>
        </div>
      </div>
    </div>
  );
}
