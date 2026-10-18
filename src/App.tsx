import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './lib/store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { TutorsManagementPage } from './pages/admin/TutorsManagementPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

// Tutor Pages
import { TutorDashboardPage } from './pages/tutor/TutorDashboardPage';
import { StudentsPage } from './pages/tutor/StudentsPage';
import { StudentDetailPage } from './pages/tutor/StudentDetailPage';
import { ProgramsPage } from './pages/tutor/ProgramsPage';
import { SchedulesPage } from './pages/tutor/SchedulesPage';
import { MonitoringSessionsPage } from './pages/tutor/MonitoringSessionsPage';
import { StudentProgressPage } from './pages/tutor/StudentProgressPage';
import { ReportsPage } from './pages/tutor/ReportsPage';

export function App() {
  const store = useAppStore();
  const currentUser = store.currentUser;

  // Root redirect logic
  const defaultHome = currentUser?.role === 'admin' ? '/admin' : '/tutor';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/tutors" element={<TutorsManagementPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
          </Route>
        </Route>

        {/* Protected Tutor Routes */}
        <Route element={<ProtectedRoute allowedRole="tutor" />}>
          <Route element={<AppLayout />}>
            <Route path="/tutor" element={<TutorDashboardPage />} />
            <Route path="/tutor/students" element={<StudentsPage />} />
            <Route path="/tutor/students/:id" element={<StudentDetailPage />} />
            <Route path="/tutor/programs" element={<ProgramsPage />} />
            <Route path="/tutor/schedules" element={<SchedulesPage />} />
            <Route path="/tutor/sessions" element={<MonitoringSessionsPage />} />
            <Route path="/tutor/progress" element={<StudentProgressPage />} />
            <Route path="/tutor/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to={defaultHome} replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to={defaultHome} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
