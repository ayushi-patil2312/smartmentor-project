import React, { useState } from 'react';
import { Bell, Download, Flag, Moon, Search, UserPlus, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f4f5fb]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100 lg:max-w-md">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search students or records..."
              className="w-full bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-100">
              <Bell size={16} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-100">
              <Moon size={16} />
            </button>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#4b4db8] shadow-sm ring-1 ring-gray-100">
              Mentorship Tracking
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#6b45d6]">Overview</span>
            <h1 className="text-4xl font-bold leading-tight text-[#131722]">Active Mentorships</h1>
            <p className="mt-2 max-w-2xl text-base text-gray-500">
              You are currently guiding {myStudents.length} students toward their academic milestones this semester.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#4b4db8] shadow-md shadow-[#4b4db8]/5 ring-1 ring-gray-100">
              <Download size={15} /> Export Data
            </button>
            <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[#4c50d9] px-6 text-sm font-semibold text-white shadow-md shadow-[#4c50d9]/30">
              <UserPlus size={15} /> Add New Student
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {isLoading ? (
            <div className="rounded-3xl bg-white p-8 text-gray-500 shadow-sm ring-1 ring-gray-100">
              Loading your students...
            </div>
          ) : myStudents.map((student, index) => (
              <div key={student.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a5fe2] to-[#8538de] text-lg font-bold text-white">
                        {student.name?.[0] || 'S'}
                      </div>
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div>
                      <h3 className="text-[28px] font-semibold leading-none text-[#131722]">{student.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {student.course || student.email || 'Academic Mentorship'}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${index % 2 === 0 ? 'bg-[#d7faf2] text-[#0d9b7f]' : 'bg-[#efe6ff] text-[#7f4cd4]'}`}>
                    {index % 2 === 0 ? 'Active' : 'Milestone Near'}
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#f4f5fb] px-3 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Grade Avg</p>
                    <p className="mt-2 text-[30px] font-semibold text-[#6b45d6]">{index % 2 === 0 ? 'A-' : 'A+'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f4f5fb] px-3 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Attendance</p>
                    <p className="mt-2 text-[30px] font-semibold text-[#6b45d6]">{index % 2 === 0 ? '94%' : '98%'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f4f5fb] px-3 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Sessions</p>
                    <p className="mt-2 text-[30px] font-semibold text-[#444ab8]">{index % 2 === 0 ? '12' : '15'}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#131722]">Semester Progress</span>
                    <span className="font-semibold text-[#4d4fd6]">{index % 2 === 0 ? '78%' : '92%'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#ececf6]">
                    <div
                      className={`h-2 rounded-full ${index % 2 === 0 ? 'bg-[#4d4fd6]' : 'bg-[#8c3fe3]'}`}
                      style={{ width: index % 2 === 0 ? '78%' : '92%' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="h-11 rounded-xl bg-[#f5f5fc] text-sm font-semibold text-[#4b4db8]">View Logs</button>
                  <button
                    onClick={() => { setSelectedStudent(student.id); setIsFeedbackModalOpen(true); }}
                    className="h-11 rounded-xl bg-[#4c50d9] text-sm font-semibold text-white"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            ))}
          {(!isLoading && myStudents.length === 0) && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm xl:col-span-2">
              <Users className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="font-medium text-gray-500">No students currently assigned to you.</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 xl:col-span-2">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-[36px] font-semibold leading-tight text-[#131722]">Assign Academic Goals</h2>
                <p className="mt-1 text-sm text-gray-500">Define new targets for the current mentorship cycle.</p>
              </div>
              <Flag size={15} className="mt-2 text-[#d7d1ef]" />
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Select Student</label>
                  <select
                    value={selectedStudent || ''}
                    onChange={(e) => setSelectedStudent(e.target.value || null)}
                    className="h-12 w-full rounded-xl border border-transparent bg-[#eef0f5] px-4 text-sm text-[#131722] outline-none focus:ring-2 focus:ring-[#4d4fd6]/40"
                  >
                    <option value="" disabled>Select student</option>
                    {myStudents.map((student) => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Priority Setting</label>
                  <div className="flex gap-2">
                    <button type="button" className="h-12 flex-1 rounded-full bg-[#eef0f5] text-xs font-semibold text-gray-700">Low</button>
                    <button type="button" className="h-12 flex-1 rounded-full border-2 border-[#4d4fd6] bg-[#eef0f5] text-xs font-semibold text-[#4d4fd6]">Medium</button>
                    <button type="button" className="h-12 flex-1 rounded-full bg-[#eef0f5] text-xs font-semibold text-gray-700">High</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Goal Description</label>
                <input
                  required
                  type="text"
                  className="h-14 w-full rounded-2xl border border-transparent bg-[#eef0f5] px-4 text-sm text-[#131722] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#4d4fd6]/40"
                  placeholder="e.g. Complete the advanced algorithm design modules..."
                  value={goal.title}
                  onChange={e => setGoal({ ...goal, title: e.target.value })}
                />
              </div>

              <div className="pt-2 text-right">
                <button type="submit" className="h-12 rounded-full bg-[#4c50d9] px-8 text-sm font-semibold text-white shadow-md shadow-[#4c50d9]/30">
                  Publish Goal
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-[36px] font-semibold leading-tight text-[#131722]">Quick Feedback</h2>
            <p className="mt-3 text-sm text-gray-500">Submit a quick observation for your last session. This will be visible to the student immediately.</p>

            <div className="my-6 flex gap-3">
              {['😞', '😕', '😊', '🙂'].map((face, idx) => (
                <button
                  key={face}
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${idx === 2 ? 'border-[#4c50d9] text-[#4c50d9]' : 'border-[#ececf6] text-gray-400'}`}
                >
                  {face}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddFeedback} className="space-y-3">
              <input
                type="text"
                className="h-11 w-full rounded-xl border border-transparent bg-[#f1f2f8] px-4 text-sm text-[#131722] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#4d4fd6]/40"
                placeholder="Short session title..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
              />
              <textarea
                required
                className="min-h-[92px] w-full resize-none rounded-xl border border-transparent bg-[#f1f2f8] px-4 py-3 text-sm text-[#131722] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#4d4fd6]/40"
                placeholder="How did they do today?"
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
              />
              <button type="submit" className="mt-2 h-12 w-full rounded-full bg-[#4c50d9] text-sm font-semibold text-white shadow-md shadow-[#4c50d9]/30">
                Send Update
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Recent Activity Feed</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e9a7f]">Completed</p>
              <p className="mt-2 font-semibold text-[#131722]">Julian submitted Algorithm Final</p>
              <p className="mt-2 text-xs text-gray-400">2 hours ago</p>
            </div>
            <div className="rounded-2xl border-l-4 border-[#8f3ee4] bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f3ee4]">Note</p>
              <p className="mt-2 font-semibold text-[#131722]">Elena requested a reschedule</p>
              <p className="mt-2 text-xs text-gray-400">4 hours ago</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e9a7f]">Milestone</p>
              <p className="mt-2 font-semibold text-[#131722]">Sarah hit 10 sessions!</p>
              <p className="mt-2 text-xs text-gray-400">Yesterday</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Upcoming</p>
              <p className="mt-2 font-semibold text-[#131722]">Review: Career Roadmap</p>
              <p className="mt-2 text-xs text-gray-400">Tomorrow, 10:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
