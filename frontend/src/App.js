import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import HRCreation from './pages/HRCreation';
import EmployeeCreation from './pages/EmployeeCreation';
import Departments from './pages/Departments';
import EmployeeVerification from './pages/EmployeeVerification';
import HRLeaveManagement from './pages/HRLeaveManagement';
import HRSalaryManagement from './pages/HRSalaryManagement';
import ManagerLeaveApproval from './pages/ManagerLeaveApproval';
import ManagerCreation from './pages/ManagerCreation';
import TaskAssignment from './pages/TaskAssignment';
import LeaveApplication from './pages/LeaveApplication';
import MyTasks from './pages/MyTasks';
import MySalary from './pages/MySalary';
import IssueTracker from './pages/IssueTracker';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<Layout><Dashboard /></Layout>} />
            <Route path="/admin/employee-creation" element={<Layout><EmployeeCreation /></Layout>} />
            <Route path="/admin/hr-creation" element={<Layout><HRCreation /></Layout>} />
            <Route path="/admin/departments" element={<Layout><Departments /></Layout>} />
            <Route path="/admin/issues" element={<Layout><IssueTracker /></Layout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
            <Route path="/hr" element={<Layout><Dashboard /></Layout>} />
            <Route path="/hr/verification" element={<Layout><EmployeeVerification /></Layout>} />
            <Route path="/hr/manager-creation" element={<Layout><ManagerCreation /></Layout>} />
            <Route path="/hr/leaves" element={<Layout><HRLeaveManagement /></Layout>} />
            <Route path="/hr/salaries" element={<Layout><HRSalaryManagement /></Layout>} />
            <Route path="/hr/issues" element={<Layout><IssueTracker /></Layout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route path="/manager" element={<Layout><Dashboard /></Layout>} />
            <Route path="/manager/tasks" element={<Layout><TaskAssignment /></Layout>} />
            <Route path="/manager/leaves" element={<Layout><ManagerLeaveApproval /></Layout>} />
            <Route path="/manager/issues" element={<Layout><IssueTracker /></Layout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route path="/employee" element={<Layout><Dashboard /></Layout>} />
            <Route path="/employee/apply-leave" element={<Layout><LeaveApplication /></Layout>} />
            <Route path="/employee/tasks" element={<Layout><MyTasks /></Layout>} />
            <Route path="/employee/salary" element={<Layout><MySalary /></Layout>} />
            <Route path="/employee/issues" element={<Layout><IssueTracker /></Layout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']} />}>
            <Route path="/chat" element={<Layout><Chat /></Layout>} />
            <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<div className="p-10 text-center">Unauthorized Access</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
