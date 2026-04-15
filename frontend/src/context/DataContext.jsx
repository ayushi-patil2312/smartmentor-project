import React, { createContext, useContext, useState, useEffect } from 'react';
import BASE_URL from '../api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({
    users: [],
    goals: [],
    feedbacks: [],
    academicData: []
  });

  const fetchAllData = async () => {
    try {
      const [usersRes, goalsRes, feedbacksRes, perfRes] = await Promise.all([
        fetch(`${BASE_URL}/users`).then(r => r.json()),
        fetch(`${BASE_URL}/goals`).then(r => r.json()),
        fetch(`${BASE_URL}/feedbacks`).then(r => r.json()),
        fetch(`${BASE_URL}/reports/performance`).then(r => r.json())
      ]);

      setData({
        users: Array.isArray(usersRes) ? usersRes : [],
        // the APIs return { status: 'success', data: [...] } for some endpoints
        goals: goalsRes.data || goalsRes || [],
        feedbacks: feedbacksRes.data || feedbacksRes || [],
        academicData: perfRes.data || perfRes || []
      });
    } catch (error) {
      console.error("Error fetching data from API:", error);
      alert("Server not reachable");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- User CRUD ---
  const addUser = async (user) => {
    try {
      await fetch(`${BASE_URL}/users/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          password: user.password || '1234'
        })
      });
      fetchAllData();
    } catch (err) { console.error(err); }
  };
  
  const deleteUser = async (id) => {
    try {
      await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) { console.error(err); }
  };
  
  const assignMentor = async (studentId, mentorId) => {
    try {
      await fetch(`${BASE_URL}/users/assign-mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, mentor_id: mentorId })
      });
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  // --- Goal CRUD ---
  const addGoal = async (goal) => {
    try {
      await fetch(`${BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: goal.studentId, title: goal.title })
      });
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  const updateGoalProgress = async (id, progress) => {
    try {
      await fetch(`${BASE_URL}/goals/${id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  // --- Feedback CRUD ---
  const addFeedback = async (feedback) => {
    try {
      await fetch(`${BASE_URL}/mentor/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: feedback.studentId, mentor_id: feedback.mentorId, text: feedback.text })
      });
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  // --- Academic Data CRUD ---
  const updateAcademicRecord = async (studentId, type, newRecordData) => {
    try {
      await fetch(`${BASE_URL}/student/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, type, data: newRecordData })
      });
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  return (
    <DataContext.Provider value={{
      data,
      refreshData: fetchAllData,
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
