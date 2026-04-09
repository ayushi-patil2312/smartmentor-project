import React, { useState } from 'react';
import { Users, Target, MessageSquare, PlusCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import BASE_URL from '../../api';

export default function MentorDashboard() {
  const { data, addFeedback, addGoal } = useData();
  const { user } = useAuth();
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [goal, setGoal] = useState({ title: '', progress: 0 });

  const [myStudents, setMyStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadStudents = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`${BASE_URL}/mentor/students/${user.id}`);
          const data = await res.json();
          setMyStudents(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load students", err);
          alert("Server not reachable. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, [user]);

  const handleAddFeedback = (e) => {
    e.preventDefault();
    addFeedback({ studentId: selectedStudent, mentorId: user?.id, text: feedbackText });
    setFeedbackText('');
    setIsFeedbackModalOpen(false);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    addGoal({ studentId: selectedStudent, title: goal.title, progress: parseInt(goal.progress), status: 'In Progress' });
    setGoal({ title: '', progress: 0 });
    setIsGoalModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1 block">Overview</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Active Mentorships</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">You are currently guiding {myStudents.length} students toward their academic milestones.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Users size={18} /> View All Contacts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <p className="text-gray-500">Loading your students...</p>
        ) : myStudents.map((student) => (
            <div key={student.id} className="card relative p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center text-xl font-bold text-primary shadow-inner">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 px-3 py-1">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button 
                  onClick={() => { setSelectedStudent(student.id); setIsFeedbackModalOpen(true); }}
                  className="btn-secondary !bg-gray-50 dark:!bg-gray-800 border-none !text-primary hover:!bg-primary/10 transition-colors py-3"
                >
                  Submit Feedback
                </button>
                <button 
                  onClick={() => { setSelectedStudent(student.id); setIsGoalModalOpen(true); }}
                  className="btn-primary py-3"
                >
                  Assign Goal
                </button>
              </div>
            </div>
          ))}
        {(!isLoading && myStudents.length === 0) && (
          <div className="col-span-1 lg:col-span-2 text-center py-12 card border border-dashed border-gray-300 dark:border-gray-700 bg-transparent">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">No students currently assigned to you.</p>
          </div>
        )}
      </div>



      <Modal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} title="Quick Feedback">
        <form onSubmit={handleAddFeedback} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Submit a quick observation for your last session. This will be visible to the student immediately.</p>
          <div>
            <textarea 
              required 
              className="input-field min-h-[120px] bg-gray-50/50 resize-none rounded-2xl p-4" 
              value={feedbackText} 
              onChange={e => setFeedbackText(e.target.value)} 
              placeholder="e.g. Great improvement in algorithms..."
            />
          </div>
          <button type="submit" className="btn-primary w-full h-12 text-base font-semibold">Send Update</button>
        </form>
      </Modal>

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Assign Academic Goals">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">Define new targets for the current mentorship cycle.</p>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Goal Description</label>
            <input required type="text" className="input-field h-12 bg-gray-50/50 rounded-2xl" placeholder="e.g. Complete advanced algorithm modules..." value={goal.title} onChange={e => setGoal({...goal, title: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary w-full h-12 text-base font-semibold mt-4">Publish Goal</button>
        </form>
      </Modal>
    </div>
  );
}
