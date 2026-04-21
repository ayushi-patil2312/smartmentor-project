import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BASE_URL from '../api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({
    users: [],
    goals: [],
    feedbacks: [],
    performance: [],
  });

  const safeJson = async (r) => {
    try { return await r.json(); } catch { return null; }
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, goalsRes, feedbacksRes, perfRes] = await Promise.all([
        fetch(`${BASE_URL}/api/users`).then(safeJson),
        fetch(`${BASE_URL}/api/goals`).then(safeJson),
        fetch(`${BASE_URL}/api/feedbacks`).then(safeJson),
        fetch(`${BASE_URL}/api/reports/performance`).then(safeJson),
      ]);
      setData({
        users: Array.isArray(usersRes) ? usersRes : [],
        goals: Array.isArray(goalsRes) ? goalsRes : [],
        feedbacks: Array.isArray(feedbacksRes) ? feedbacksRes : [],
        performance: Array.isArray(perfRes) ? perfRes : [],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ── Users ──
  const addUser = async (user) => {
    await fetch(`${BASE_URL}/api/users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name, email: user.email,
        role: user.role, password: user.password || '1234',
      }),
    });
    fetchAllData();
  };

  const deleteUser = async (id) => {
    await fetch(`${BASE_URL}/api/users/${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const assignMentor = async (studentId, mentorId, requestId = null) => {
    await fetch(`${BASE_URL}/api/assign-mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, mentor_id: mentorId, request_id: requestId }),
    });
    fetchAllData();
  };

  // ── Goals ──
  const addGoal = async (goal) => {
    await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: goal.studentId, title: goal.title }),
    });
    fetchAllData();
  };

  const updateGoalProgress = async (id, progress) => {
    await fetch(`${BASE_URL}/api/goals/${id}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    fetchAllData();
  };

  // ── Feedback ──
  const addFeedback = async (fb) => {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: fb.studentId,
        mentor_id: fb.mentorId,
        feedback_text: fb.text,
        rating: fb.rating,
      }),
    });
    fetchAllData();
    return safeJson(res);
  };

  // ── Performance ──
  const savePerformance = async (perf) => {
    const res = await fetch(`${BASE_URL}/api/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perf),
    });
    fetchAllData();
    return safeJson(res);
  };

  // ── Mentor Requests ──
  const requestMentor = async ({ studentId, preferredSubject, message }) => {
    const res = await fetch(`${BASE_URL}/api/request-mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId, preferred_subject: preferredSubject, message,
      }),
    });
    return safeJson(res);
  };

  return (
    <DataContext.Provider value={{
      data,
      refreshData: fetchAllData,
      addUser, deleteUser, assignMentor,
      addGoal, updateGoalProgress,
      addFeedback,
      savePerformance,
      requestMentor,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
