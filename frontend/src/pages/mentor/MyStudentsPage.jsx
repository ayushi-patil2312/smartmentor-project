import React, { useEffect, useState, useCallback } from 'react';
import { Users, MessageSquare, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';
import BASE_URL from '../../api';

export default function MyStudentsPage() {
  const { user } = useAuth();
  const { addFeedback } = useData();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/my-students/${user.id}`);
      const json = await res.json();
      setStudents(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await addFeedback({
        studentId: selected.id,
        mentorId: user.id,
        text: feedback.text,
        rating: Number(feedback.rating),
      });
      setSelected(null);
      setFeedback({ text: '', rating: 5 });
    } finally {
      setSubmitting(false);
    }
  };

  const avgScore = (marks) => {
    if (!Array.isArray(marks) || marks.length === 0) return null;
    const sum = marks.reduce((a, m) => a + (Number(m.score) || 0), 0);
    return Math.round(sum / marks.length);
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Students</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          Students currently assigned to your mentorship.
        </p>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : students.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">No students assigned yet. Once an admin assigns students to you they'll appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s) => {
            const avg = avgScore(s.marks);
            return (
              <div key={s.id} className="card flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                    {s.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{s.name}</h3>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Mail size={12} /> {s.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Attendance</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {s.attendance != null ? `${s.attendance}%` : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Avg Score</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {avg != null ? avg : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Hours</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {s.study_hours != null ? s.study_hours : '—'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSelected(s); setFeedback({ text: '', rating: 5 }); }}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Give Feedback
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Feedback for ${selected.name}` : 'Feedback'}
      >
        <form onSubmit={submitFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Feedback
            </label>
            <textarea
              required
              className="input-field min-h-[120px]"
              placeholder="Share your observations..."
              value={feedback.text}
              onChange={(e) => setFeedback({ ...feedback, text: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Rating (1–5)
            </label>
            <select
              className="input-field"
              value={feedback.rating}
              onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })}
            >
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
