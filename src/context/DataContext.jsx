import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

const initialData = {
  users: [
    { id: 'admin-1', name: 'Admin User', role: 'admin', email: 'admin@example.com' },
    { id: 'mentor-1', name: 'Dr. Mentor', role: 'mentor', email: 'mentor@example.com' },
    { id: 'student-1', name: 'John Doe', role: 'student', email: 'student@example.com', mentorId: 'mentor-1' },
    { id: 'student-2', name: 'Alice Smith', role: 'student', email: 'student2@example.com', mentorId: null },
  ],
  goals: [
    { id: 'g1', studentId: 'student-1', title: 'Complete React Course', progress: 80, status: 'In Progress' },
    { id: 'g2', studentId: 'student-1', title: 'Submit Assignment 3', progress: 100, status: 'Completed' },
  ],
  feedbacks: [
    { id: 'f1', studentId: 'student-1', mentorId: 'mentor-1', text: 'Great improvement on React. Keep it up!', date: new Date().toISOString() },
  ],
  academicData: [
    { id: 'a1', studentId: 'student-1', type: 'marks', data: [{subject: 'React', score: 95}, {subject: 'Node', score: 85}, {subject: 'DB', score: 90}] },
    { id: 'a2', studentId: 'student-1', type: 'progressOverTime', data: [{name: 'Week 1', score: 70}, {name: 'Week 2', score: 75}, {name: 'Week 3', score: 85}, {name: 'Week 4', score: 90}] }
  ]
};

const defaultUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "1234",
    role: "admin"
  },
  {
    id: 2,
    name: "Mentor User",
    email: "mentor@example.com",
    password: "1234",
    role: "mentor"
  },
  {
    id: 3,
    name: "Student User",
    email: "student@example.com",
    password: "1234",
    role: "student"
  }
];

export function DataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('smartMentorData');
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem('smartMentorData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");

    if (!storedUsers) {
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // --- Utility Updates ---
  const updateStore = (key, newData) => {
    setData(prev => ({ ...prev, [key]: newData }));
  };

  // --- User CRUD ---
  const addUser = (user) => {
    const newUser = { ...user, id: Date.now() };
    updateStore('users', [...data.users, newUser]);
  };
  
  const deleteUser = (id) => updateStore('users', data.users.filter(u => u.id !== id));
  
  const assignMentor = (studentId, mentorId) => {
    updateStore('users', data.users.map(u => u.id === studentId ? { ...u, mentorId } : u));
  };

  // --- Goal CRUD ---
  const addGoal = (goal) => updateStore('goals', [...data.goals, { ...goal, id: Date.now() }]);
  const updateGoalProgress = (id, progress) => {
    updateStore('goals', data.goals.map(g => g.id === id ? { ...g, progress, status: progress === 100 ? 'Completed' : 'In Progress' } : g));
  };

  // --- Feedback CRUD ---
  const addFeedback = (feedback) => updateStore('feedbacks', [...data.feedbacks, { ...feedback, id: Date.now(), date: new Date().toISOString() }]);

  // --- Academic Data CRUD ---
  const updateAcademicRecord = (studentId, type, newRecordData) => {
    const currentRecords = data.academicData;
    const existingIndex = currentRecords.findIndex(r => r.studentId === studentId && r.type === type);
    
    if (existingIndex >= 0) {
      const updated = [...currentRecords];
      updated[existingIndex] = { ...updated[existingIndex], data: newRecordData };
      updateStore('academicData', updated);
    } else {
      updateStore('academicData', [...currentRecords, { id: Date.now(), studentId, type, data: newRecordData }]);
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      addUser, deleteUser, assignMentor,
      addGoal, updateGoalProgress,
      addFeedback,
      updateAcademicRecord
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
