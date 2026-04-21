import React, { useEffect, useState, useCallback } from 'react';
import {
  Award, BookOpen, Clock, Target, TrendingUp, Plus,
  AlertTriangle, Lightbulb, MessageSquare, UserPlus,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import BASE_URL from '../../api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { savePerformance, requestMentor } = useData();

  const [performance, setPerformance] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [record, setRecord] = useState({ subject: '', score: '' });
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [attForm, setAttForm] = useState({ attendance: '', studyHours: '' });

  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [mentorForm, setMentorForm] = useState({ preferredSubject: '', message: '' });
  const [mentorErr, setMentorErr] = useState('');

  const studentId = user?.id;

  const fetchAll = useCallback(async () => {
    if (!studentId) return;
    const [perf, fb, rec, reqs] = await Promise.all([
      fetch(`${BASE_URL}/api/performance/${studentId}`).then((r) => r.json()).catch(() => null),
      fetch(`${BASE_URL}/api/feedback/${studentId}`).then((r) => r.json()).catch(() => []),
      fetch(`${BASE_URL}/api/recommendations/${studentId}`).then((r) => r.json()).catch(() => []),
      fetch(`${BASE_URL}/api/my-requests/${studentId}`).then((r) => r.json()).catch(() => []),
    ]);
    setPerformance(perf);
    setFeedbacks(Array.isArray(fb) ? fb : []);
    setRecommendations(Array.isArray(rec) ? rec : []);
    setMyRequests(Array.isArray(reqs) ? reqs : []);
  }, [studentId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const marks = Array.isArray(performance?.marks) ? performance.marks : [];
  const attendance = performance?.attendance ?? 0;
  const studyHours = performance?.study_hours ?? 0;

  const avg = marks.length
    ? Math.round(marks.reduce((a, m) => a + (Number(m.score) || 0), 0) / marks.length)
    : 0;
  const grade = (() => {
    if (!marks.length) return 'N/A';
    if (avg >= 90) return 'A+';
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    return 'D';
  })();

  const progressData = marks.map((m, i) => ({
    name: m.subject || `#${i + 1}`,
    score: Number(m.score) || 0,
  }));

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const updatedMarks = [...marks, { subject: record.subject, score: Number(record.score) }];
    await savePerformance({
      student_id: studentId,
      attendance, marks: updatedMarks, study_hours: studyHours,
    });
    setRecord({ subject: '', score: '' });
    setIsRecordModalOpen(false);
    fetchAll();
  };

  const handleSaveAtt = async (e) => {
    e.preventDefault();
    await savePerformance({
      student_id: studentId,
      attendance: Number(attForm.attendance) || 0,
      marks,
      study_hours: Number(attForm.studyHours) || 0,
    });
    setIsAttModalOpen(false);
    fetchAll();
  };

  const hasPending = myRequests.some((r) => r.status === 'pending');

  const handleRequestMentor = async (e) => {
    e.preventDefault();
    setMentorErr('');
    const res = await requestMentor({
      studentId,
      preferredSubject: mentorForm.preferredSubject,
      message: mentorForm.message,
    });
    if (res?.error) {
      setMentorErr(res.error);
      return;
    }
    setMentorForm({ preferredSubject: '', message: '' });
    setIsMentorModalOpen(false);
    fetchAll();
  };

  const recColor = (level) => ({
    danger: 'bg-red-50 dark:bg-red-500/10 border-red-200 text-red-700 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 text-blue-700 dark:text-blue-300',
  }[level] || 'bg-gray-50 border-gray-200 text-gray-700');

  return (
    <div className="w-full space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Academic Overview
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => setIsMentorModalOpen(true)}
            disabled={hasPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
            title={hasPending ? 'You already have a pending request' : 'Request a mentor'}
          >
            <UserPlus size={18} /> {hasPending ? 'Request Pending' : 'Request Mentor'}
          </button>
          <button
            onClick={() => {
              setAttForm({ attendance: String(attendance || ''), studyHours: String(studyHours || '') });
              setIsAttModalOpen(true);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Clock size={18} /> Update Attendance
          </button>
          <button onClick={() => setIsRecordModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Update Marks
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-yellow-500" /> Recommendations for you
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((r, i) => (
              <div key={i} className={`border rounded-xl p-4 ${recColor(r.level)}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{r.title}</p>
                    <p className="text-xs mt-1 opacity-90">{r.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Average Grade</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{grade}</h2>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> Based on {marks.length} record{marks.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Attendance</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{attendance}%</h2>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full ${attendance < 75 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(attendance, 100)}%` }}
            />
          </div>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Study Hours</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{studyHours}</h2>
          <p className="text-xs text-gray-500 mt-2">This week</p>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mentor Feedbacks</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{feedbacks.length}</h2>
          <p className="text-xs text-gray-500 mt-2">Total received</p>
        </div>
      </div>

      {/* Chart + Feedbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="text-primary" size={18} /> Performance by Subject
          </h3>
          <div className="w-full h-[300px]">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} dot={{ strokeWidth: 3, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <BookOpen className="text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 italic text-sm">No marks yet — add your first record to see trends.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-500" /> Mentor Feedback
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {feedbacks.length === 0 && (
              <p className="text-sm italic text-gray-500">No feedback received yet.</p>
            )}
            {feedbacks.map((f) => (
              <div key={f.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{f.mentor_name || 'Mentor'}</p>
                  {f.rating ? <span className="text-xs text-yellow-500">{'★'.repeat(f.rating)}</span> : null}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">"{f.feedback_text}"</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-2">
                  {f.created_at && new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Requests */}
      {myRequests.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={18} className="text-emerald-500" /> My Mentor Requests
          </h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-gray-400">
                <tr><th className="text-left py-2">Subject</th><th className="text-left py-2">Message</th><th className="text-left py-2">Status</th><th className="text-left py-2">Date</th></tr>
              </thead>
              <tbody>
                {myRequests.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-3 font-medium">{r.preferred_subject}</td>
                    <td className="py-3 text-gray-500">{r.message || '—'}</td>
                    <td className="py-3">
                      <span className={`badge ${r.status === 'assigned' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{r.created_at && new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Add Academic Record">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input required type="text" className="input-field" value={record.subject}
              onChange={(e) => setRecord({ ...record, subject: e.target.value })} placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Score (0-100)</label>
            <input required type="number" min="0" max="100" className="input-field" value={record.score}
              onChange={(e) => setRecord({ ...record, score: e.target.value })} placeholder="85" />
          </div>
          <button type="submit" className="btn-primary w-full">Save Record</button>
        </form>
      </Modal>

      <Modal isOpen={isAttModalOpen} onClose={() => setIsAttModalOpen(false)} title="Update Attendance & Hours">
        <form onSubmit={handleSaveAtt} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Attendance (%)</label>
            <input required type="number" min="0" max="100" className="input-field" value={attForm.attendance}
              onChange={(e) => setAttForm({ ...attForm, attendance: e.target.value })} placeholder="e.g. 85" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Study Hours (this week)</label>
            <input required type="number" min="0" className="input-field" value={attForm.studyHours}
              onChange={(e) => setAttForm({ ...attForm, studyHours: e.target.value })} placeholder="e.g. 20" />
          </div>
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Modal>

      <Modal isOpen={isMentorModalOpen} onClose={() => setIsMentorModalOpen(false)} title="Request a Mentor">
        <form onSubmit={handleRequestMentor} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Subject</label>
            <input required type="text" className="input-field" value={mentorForm.preferredSubject}
              onChange={(e) => setMentorForm({ ...mentorForm, preferredSubject: e.target.value })} placeholder="e.g. Calculus" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea className="input-field min-h-[100px]" value={mentorForm.message}
              onChange={(e) => setMentorForm({ ...mentorForm, message: e.target.value })} placeholder="Tell us what you'd like help with..." />
          </div>
          {mentorErr && <p className="text-sm text-red-500">{mentorErr}</p>}
          <button type="submit" className="btn-primary w-full">Submit Request</button>
        </form>
      </Modal>
    </div>
  );
}
