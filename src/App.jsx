import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

const FallbackRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />;
};
import ReportsPage from './pages/shared/ReportsPage';
import ProfilePage from './pages/shared/ProfilePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route element={<DashboardLayout />}>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Mentor Routes */}
                <Route path="/mentor" element={<MentorDashboard />} />
                
                {/* Student Routes */}
                <Route path="/student" element={<StudentDashboard />} />
                
                {/* Shared Routes */}
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<FallbackRoute />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
